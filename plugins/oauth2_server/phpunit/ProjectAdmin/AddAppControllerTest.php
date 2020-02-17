<?php
/**
 * Copyright (c) Enalean, 2020-Present. All Rights Reserved.
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

declare(strict_types=1);

namespace Tuleap\OAuth2Server\ProjectAdmin;

use Mockery as M;
use Mockery\Adapter\Phpunit\MockeryPHPUnitIntegration;
use PHPUnit\Framework\TestCase;
use Tuleap\Layout\BaseLayout;
use Tuleap\OAuth2Server\App\AppDao;
use Tuleap\OAuth2Server\App\NewOAuth2App;
use Tuleap\Project\Admin\Routing\ProjectAdministratorChecker;
use Tuleap\Request\ProjectRetriever;

final class AddAppControllerTest extends TestCase
{
    use MockeryPHPUnitIntegration;

    /** @var AddAppController */
    private $controller;
    /**
     * @var M\LegacyMockInterface|M\MockInterface|ProjectRetriever
     */
    private $project_retriever;
    /**
     * @var M\LegacyMockInterface|M\MockInterface|ProjectAdministratorChecker
     */
    private $administrator_checker;
    /**
     * @var M\LegacyMockInterface|M\MockInterface|AppDao
     */
    private $app_dao;
    /**
     * @var \CSRFSynchronizerToken|M\LegacyMockInterface|M\MockInterface
     */
    private $csrf_token;

    protected function setUp(): void
    {
        $this->project_retriever     = M::mock(ProjectRetriever::class);
        $this->administrator_checker = M::mock(ProjectAdministratorChecker::class);
        $this->app_dao               = M::mock(AppDao::class);
        $this->csrf_token            = M::mock(\CSRFSynchronizerToken::class);
        $this->controller            = new AddAppController(
            $this->project_retriever,
            $this->administrator_checker,
            $this->app_dao,
            $this->csrf_token
        );
    }

    public function testProcessRedirectsWithFeedbackWhenNameIsOmitted(): void
    {
        $request = M::mock(\HTTPRequest::class);
        $layout  = M::mock(BaseLayout::class);
        $this->mockValidProjectAndUserIsProjectAdmin($request);
        $request->shouldReceive('get')
            ->once()
            ->with('name')
            ->andReturn('');
        $request->shouldReceive('valid')
            ->once()
            ->andReturnTrue();

        $layout->shouldReceive('addFeedback')
            ->once()
            ->with(\Feedback::ERROR, M::type('string'));
        $layout->shouldReceive('redirect')->once();
        $this->app_dao->shouldNotReceive('create');

        $this->controller->process($request, $layout, ['project_id' => '102']);
    }

    public function testProcessRedirectsWithFeedbackWhenNameIsNotValid(): void
    {
        $request = M::mock(\HTTPRequest::class);
        $layout  = M::mock(BaseLayout::class);
        $this->mockValidProjectAndUserIsProjectAdmin($request);
        $request->shouldReceive('get')
            ->once()
            ->with('name')
            ->andReturn("invalid text \n");
        $request->shouldReceive('valid')
            ->once()
            ->andReturnFalse();

        $layout->shouldReceive('addFeedback')
            ->once()
            ->with(\Feedback::ERROR, M::type('string'));
        $layout->shouldReceive('redirect')->once();
        $this->app_dao->shouldNotReceive('create');

        $this->controller->process($request, $layout, ['project_id' => '102']);
    }

    public function testProcessCreatesAppAndRedirects(): void
    {
        $request = M::mock(\HTTPRequest::class);
        $layout  = M::mock(BaseLayout::class);
        $this->mockValidProjectAndUserIsProjectAdmin($request);
        $request->shouldReceive('get')
            ->once()
            ->with('name')
            ->andReturn('overdeliciously');
        $request->shouldReceive('valid')
            ->once()
            ->andReturnTrue();

        $this->app_dao->shouldReceive('create')
            ->once()
            ->with(M::type(NewOAuth2App::class));
        $layout->shouldReceive('redirect')->once();

        $this->controller->process($request, $layout, ['project_id' => '102']);
    }

    public function testGetUrl(): void
    {
        $project = M::mock(\Project::class)->shouldReceive('getID')
            ->once()
            ->andReturn(102)
            ->getMock();

        $this->assertSame('/plugins/oauth2_server/project/102/admin/add-app', AddAppController::getUrl($project));
    }

    private function mockValidProjectAndUserIsProjectAdmin(M\MockInterface $request): void
    {
        $project = M::mock(\Project::class)->shouldReceive('getID')
            ->once()
            ->andReturn(102)
            ->getMock();
        $this->project_retriever->shouldReceive('getProjectFromId')
            ->once()
            ->andReturn($project);
        $current_user = new \PFUser(['language_id' => 'en']);
        $request->shouldReceive('getCurrentUser')
            ->once()
            ->andReturn($current_user);
        $this->administrator_checker->shouldReceive('checkUserIsProjectAdministrator')
            ->with($current_user, $project)
            ->once();
        $this->csrf_token->shouldReceive('check')->once();
    }
}
