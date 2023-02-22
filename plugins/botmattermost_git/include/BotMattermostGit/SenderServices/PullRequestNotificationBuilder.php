<?php
/**
 * Copyright (c) Enalean, 2017-Present. All Rights Reserved.
 *
 * This file is a part of Tuleap.
 *
 * Tuleap is free software; you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation; either version 2 of the License, or
 * (at your option) any later version.
 *
 * Tuleap is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Tuleap. If not, see <http://www.gnu.org/licenses/>.
 */

namespace Tuleap\BotMattermostGit\SenderServices;

use GitRepository;
use Git_GitRepositoryUrlManager;
use PFUser;
use Project;
use TemplateRendererFactory;
use Tuleap\BotMattermost\SenderServices\Attachment;
use Tuleap\BotMattermostGit\Presenter\AttachmentPreTextPresenter;
use Tuleap\PullRequest\PullRequest;
use Tuleap\ServerHostname;

class PullRequestNotificationBuilder
{
    private $repository_url_manager;

    public function __construct(Git_GitRepositoryUrlManager $repository_url_manager)
    {
        $this->repository_url_manager = $repository_url_manager;
    }

    public function buildNotificationAttachment(
        PullRequest $pull_request,
        PFUser $user,
        Project $project,
        GitRepository $repository_destination,
    ) {
        $text       = $this->makeText($pull_request->getDescription());
        $title_link = $this->makeTitleLink($pull_request, $project);
        $pretext    = $this->makePreText(
            $pull_request,
            $user,
            $repository_destination
        );

        return new Attachment($pretext, $pull_request->getTitle(), $title_link, $text);
    }

    private function makePreText(
        PullRequest $pull_request,
        PFUser $user,
        GitRepository $repository_destination,
    ) {
        $renderer =  TemplateRendererFactory::build()->getRenderer(
            PLUGIN_BOT_MATTERMOST_GIT_BASE_DIR . '/templates/attachment'
        );

        return $renderer->renderToString(
            'pretext',
            new AttachmentPreTextPresenter(
                $pull_request,
                $user,
                $repository_destination,
                $this->repository_url_manager
            )
        );
    }

    private function makeText($pull_request_description)
    {
        $text = '';
        if (! empty($pull_request_description)) {
            $text = $pull_request_description;
        }

        return $text;
    }

    private function makeTitleLink(PullRequest $pull_request, Project $project)
    {
        return ServerHostname::HTTPSUrl() . GIT_BASE_URL . '/?' . http_build_query(
            [
                'action'   => 'pull-requests',
                'repo_id'  => $pull_request->getRepositoryId(),
                'group_id' => $project->getID(),
            ]
        ) . '#/pull-requests/' . $pull_request->getId() . '/overview';
    }
}
