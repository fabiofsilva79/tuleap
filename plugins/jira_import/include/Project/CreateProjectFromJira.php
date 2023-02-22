<?php
/**
 * Copyright (c) Enalean, 2021-Present. All Rights Reserved.
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
 *
 */

declare(strict_types=1);

namespace Tuleap\JiraImport\Project;

use Project;
use ProjectCreationData;
use ProjectCreator;
use ProjectXMLImporter;
use Psr\Log\LoggerInterface;
use SimpleXMLElement;
use Tuleap\JiraImport\JiraAgile\Board\Backlog\JiraBoardBacklogRetrieverFromAPI;
use Tuleap\JiraImport\JiraAgile\Board\JiraBoardConfigurationRetrieverFromAPI;
use Tuleap\JiraImport\JiraAgile\IssuesLinkedToEpicsRetriever;
use Tuleap\JiraImport\JiraAgile\JiraBoard;
use Tuleap\JiraImport\JiraAgile\JiraBoardsRetrieverFromAPI;
use Tuleap\JiraImport\JiraAgile\JiraAgileImporter;
use Tuleap\JiraImport\JiraAgile\JiraEpicFromIssueTypeRetrieverFromAPI;
use Tuleap\JiraImport\JiraAgile\JiraEpicIssuesRetrieverFromAPI;
use Tuleap\JiraImport\JiraAgile\JiraEpicFromBoardRetrieverFromAPI;
use Tuleap\JiraImport\JiraAgile\JiraSprintIssuesRetrieverFromAPI;
use Tuleap\JiraImport\JiraAgile\JiraSprintRetrieverFromAPI;
use Tuleap\JiraImport\Project\ArtifactLinkType\ArtifactLinkTypeImporter;
use Tuleap\JiraImport\Project\Dashboard\RoadmapDashboardCreator;
use Tuleap\JiraImport\Project\GroupMembers\GroupMembersImporter;
use Tuleap\Project\Registration\Template\EmptyTemplate;
use Tuleap\Project\Registration\Template\TemplateFactory;
use Tuleap\Project\SystemEventRunnerForProjectCreationFromXMLTemplate;
use Tuleap\Project\XML\Import\ArchiveInterface;
use Tuleap\Project\XML\Import\ImportConfig;
use Tuleap\Project\XML\XMLFileContentRetriever;
use Tuleap\ProjectMilestones\Widget\DashboardProjectMilestones;
use Tuleap\Tracker\Creation\JiraImporter\Configuration\PlatformConfigurationRetriever;
use Tuleap\Tracker\Creation\JiraImporter\Import\Artifact\LinkedIssuesCollection;
use Tuleap\Tracker\Creation\JiraImporter\Import\JiraXmlExporter;
use Tuleap\Tracker\Creation\JiraImporter\Import\Structure\FieldAndValueIDGenerator;
use Tuleap\Tracker\Creation\JiraImporter\Import\User\JiraTuleapUsersMapping;
use Tuleap\Tracker\Creation\JiraImporter\Import\User\JiraUserInfoQuerier;
use Tuleap\Tracker\Creation\JiraImporter\Import\User\JiraUserOnTuleapCache;
use Tuleap\Tracker\Creation\JiraImporter\Import\User\JiraUserRetriever;
use Tuleap\Tracker\Creation\JiraImporter\IssueType;
use Tuleap\Tracker\Creation\JiraImporter\JiraClient;
use Tuleap\Tracker\Creation\JiraImporter\JiraCredentials;
use Tuleap\Tracker\Creation\JiraImporter\JiraTrackerBuilder;
use Tuleap\Tracker\Creation\JiraImporter\UserRole\UserRolesChecker;
use Tuleap\Tracker\Creation\TrackerCreationDataChecker;
use Tuleap\Tracker\XML\Importer\TrackerImporterUser;
use Tuleap\Widget\ProjectHeartbeat;
use Tuleap\Tracker\XML\XMLTracker;
use Tuleap\Widget\ProjectMembers\ProjectMembers;
use User\XML\Import\IFindUserFromXMLReference;
use UserManager;

final class CreateProjectFromJira
{
    public function __construct(
        private UserManager $user_manager,
        private TemplateFactory $template_factory,
        private XMLFileContentRetriever $xml_file_content_retriever,
        private IFindUserFromXMLReference $user_finder,
        private JiraTrackerBuilder $jira_tracker_builder,
        private ArtifactLinkTypeImporter $artifact_link_type_importer,
        private PlatformConfigurationRetriever $platform_configuration_collection_builder,
        private \ProjectManager $project_manager,
        private UserRolesChecker $user_roles_checker,
        private RoadmapDashboardCreator $roadmap_dashboard_creator,
    ) {
    }

    /**
     * @throws \Tuleap\Project\Registration\Template\InvalidTemplateException
     * @throws \Tuleap\Project\XML\Import\ImportNotValidException
     */
    public function create(
        LoggerInterface $logger,
        JiraClient $jira_client,
        JiraCredentials $jira_credentials,
        string $jira_project,
        string $shortname,
        string $fullname,
        string $jira_epic_issue_type,
        ?int $jira_board_id,
    ): \Project {
        if ($this->project_manager->getProjectByCaseInsensitiveUnixName($shortname) !== null) {
            throw new \RuntimeException('Project shortname already exists');
        }
        $xml_element = $this->generateFromJira(
            $logger,
            $jira_client,
            $jira_credentials,
            $jira_project,
            $shortname,
            $fullname,
            $jira_epic_issue_type,
            $jira_board_id,
        );

        $archive = new JiraProjectArchive($xml_element);
        return $this->createProject($logger, $xml_element, $archive);
    }

    public function generateArchive(
        LoggerInterface $logger,
        JiraClient $jira_client,
        JiraCredentials $jira_credentials,
        string $jira_project,
        string $shortname,
        string $fullname,
        string $jira_epic_issue_type,
        ?int $jira_board_id,
        string $archive_path,
    ): void {
        $xml_element = $this->generateFromJira(
            $logger,
            $jira_client,
            $jira_credentials,
            $jira_project,
            $shortname,
            $fullname,
            $jira_epic_issue_type,
            $jira_board_id
        );

        $xml_element->saveXML($archive_path);
    }

    private function generateFromJira(
        LoggerInterface $logger,
        JiraClient $jira_client,
        JiraCredentials $jira_credentials,
        string $jira_project,
        string $shortname,
        string $fullname,
        string $jira_epic_issue_type,
        ?int $jira_board_id,
    ): SimpleXMLElement {
        $this->user_roles_checker->checkUserIsAdminOfJiraProject(
            $jira_client,
            $logger,
            $jira_project
        );

        $jira_issue_types = $this->jira_tracker_builder->buildFromProjectKey($jira_client, $jira_project);
        if (count($jira_issue_types) === 0) {
            throw new \RuntimeException("There are no Jira issue types to import");
        }

        $this->artifact_link_type_importer->import($jira_client, $logger);

        $platform_configuration_collection = $this->platform_configuration_collection_builder->getJiraPlatformConfiguration(
            $jira_client,
            $logger
        );

        $linked_issues_collection = new LinkedIssuesCollection();

        $board_retriever = new JiraBoardsRetrieverFromAPI(
            $jira_client,
            $logger,
        );

        if ($jira_board_id) {
            $board = $board_retriever->getScrumBoardByIdForProject($jira_project, $jira_board_id);
        } else {
            $board = $board_retriever->getFirstScrumBoardForProject($jira_project);
        }

        $issues_linked_to_epics_retriever = new IssuesLinkedToEpicsRetriever(
            new JiraEpicFromBoardRetrieverFromAPI(
                $jira_client,
                $logger,
            ),
            new JiraEpicFromIssueTypeRetrieverFromAPI(
                $jira_client,
                $logger,
            ),
            new JiraEpicIssuesRetrieverFromAPI(
                $jira_client,
                $logger,
            ),
        );

        $board_configuration = null;
        if ($board) {
            $board_configuration_retriever = new JiraBoardConfigurationRetrieverFromAPI(
                $jira_client,
                $logger,
            );
            $board_configuration           = $board_configuration_retriever->getScrumBoardConfiguration($board);
            if ($board_configuration === null) {
                throw new \RuntimeException('Cannot fetch configuration for board ' . $board->id);
            }
            if ($board_configuration->estimation_field) {
                $logger->debug('Agile: estimation field: ' . $board_configuration->estimation_field);
                $platform_configuration_collection->setStoryPointsField($board_configuration->estimation_field);
            }

            $linked_issues_collection = $issues_linked_to_epics_retriever->getLinkedIssuesFromBoard($board);
        } else {
            $logger->info("No scrum board found. We will try to get linked Epic issues with provided Epic issueType name");
            $logger->debug("Provided Epic issueType name: " . $jira_epic_issue_type);
            foreach ($jira_issue_types as $jira_issue_type) {
                if ($jira_issue_type->getName() === $jira_epic_issue_type) {
                    $linked_issues_collection = $issues_linked_to_epics_retriever->getLinkedIssuesFromIssueTypeInProject(
                        $jira_issue_type,
                        $jira_project,
                    );
                    break;
                }
            }
        }

        $jira_agile_importer = new JiraAgileImporter(
            new JiraSprintRetrieverFromAPI(
                $jira_client,
                $logger,
            ),
            new JiraSprintIssuesRetrieverFromAPI(
                $jira_client,
                $logger,
            ),
            new JiraBoardBacklogRetrieverFromAPI(
                $jira_client,
                $logger,
            ),
            \EventManager::instance()
        );

        $import_user = $this->user_manager->getUserById(TrackerImporterUser::ID);
        assert($import_user !== null);

        $jira_user_on_tuleap_cache = new JiraUserOnTuleapCache(
            new JiraTuleapUsersMapping(),
            $import_user,
        );

        $jira_exporter = JiraXmlExporter::build(
            $jira_client,
            $logger,
            $jira_user_on_tuleap_cache,
        );

        $template    = $this->template_factory->getTemplate(EmptyTemplate::NAME);
        $xml_element = $this->xml_file_content_retriever->getSimpleXMLElementFromFilePath($template->getXMLPath());

        $xml_element['unix-name'] = $shortname;
        $xml_element['full-name'] = $fullname;
        $xml_element['access']    = 'private';

        foreach ($xml_element->services->service as $service) {
            if (
                (string) $service['shortname'] === \trackerPlugin::SERVICE_SHORTNAME ||
                (string) $service['shortname'] === \AgileDashboardPlugin::PLUGIN_SHORTNAME
            ) {
                $service['enabled'] = '1';
            }
        }

        $group_members_importer = new GroupMembersImporter(
            $jira_client,
            $logger,
            new JiraUserRetriever(
                $logger,
                $this->user_manager,
                $jira_user_on_tuleap_cache,
                new JiraUserInfoQuerier(
                    $jira_client,
                    $logger
                ),
                $import_user
            ),
            $import_user
        );
        $xml_user_groups        = $group_members_importer->getUserGroups($jira_project);
        if ($xml_user_groups) {
            unset($xml_element->ugroups);
            $xml_user_groups->export($xml_element);
        }

        $field_id_generator = new FieldAndValueIDGenerator();

        $trackers_xml = $xml_element->addChild('trackers');

        foreach ($jira_issue_types as $jira_issue_type) {
            $logger->info(sprintf("Import tracker %s", $jira_issue_type->getName()));

            $tracker_fullname = $jira_issue_type->getName();
            $tracker_itemname = TrackerCreationDataChecker::getShortNameWithValidFormat($jira_issue_type->getName());

            $tracker = (new XMLTracker($jira_issue_type->getId(), $tracker_itemname))->withName($tracker_fullname);

            $tracker_xml = $jira_exporter->exportJiraToXml(
                $platform_configuration_collection,
                $tracker,
                $jira_credentials->getJiraUrl(),
                $jira_project,
                $jira_issue_type,
                $field_id_generator,
                $linked_issues_collection
            );

            $jira_exporter->appendTrackerXML($trackers_xml, $tracker_xml);
        }

        if ($board && $board_configuration) {
            $jira_agile_importer->exportScrum(
                $logger,
                $xml_element,
                $board,
                $board_configuration,
                $field_id_generator,
                $import_user,
                $jira_issue_types,
                $jira_epic_issue_type
            );
        }

        return $this->addWidgetOnDashboard(
            $xml_element,
            $board,
            $jira_issue_types,
            $jira_epic_issue_type,
            $logger
        );
    }

    /**
     * @param IssueType[] $jira_issue_types
     */
    private function addWidgetOnDashboard(
        \SimpleXMLElement $xml_element,
        ?JiraBoard $board,
        array $jira_issue_types,
        string $jira_epic_issue_type,
        LoggerInterface $logger,
    ): \SimpleXMLElement {
        $xml_dashboards = $xml_element->addChild('dashboards');
        $xml_dashboard  = $xml_dashboards->addChild("dashboard");
        $xml_dashboard->addAttribute('name', 'Dashboard');

        $xml_dashboard_line     = $xml_dashboard->addChild("line");
        $xml_dashboard_column01 = $xml_dashboard_line->addChild("column");
        if ($board !== null) {
            $xml_dashboard_column01->addChild("widget")->addAttribute("name", DashboardProjectMilestones::NAME);
        }
        $xml_dashboard_column01->addChild("widget")->addAttribute("name", ProjectMembers::NAME);
        $xml_dashboard_column02 = $xml_dashboard_line->addChild("column");
        $xml_dashboard_column02->addChild("widget")->addAttribute("name", ProjectHeartbeat::NAME);

        $this->roadmap_dashboard_creator->createRoadmapDashboard(
            $xml_element,
            $xml_dashboards,
            $jira_issue_types,
            $jira_epic_issue_type,
            $logger
        );

        return $xml_element;
    }

    /**
     * @throws \Tuleap\Project\Registration\Template\InvalidTemplateException
     * @throws \Tuleap\Project\XML\Import\ImportNotValidException
     */
    private function createProject(LoggerInterface $logger, SimpleXMLElement $xml_element, ArchiveInterface $archive): Project
    {
        $data = ProjectCreationData::buildFromXML(
            $xml_element,
            null,
            null,
            $logger
        );

        $project_xml_importer = ProjectXMLImporter::build(
            $this->user_finder,
            ProjectCreator::buildSelfByPassValidation(),
            $logger,
        );

        return $project_xml_importer->importWithProjectData(
            new ImportConfig(),
            $archive,
            new SystemEventRunnerForProjectCreationFromXMLTemplate(),
            $data
        );
    }
}
