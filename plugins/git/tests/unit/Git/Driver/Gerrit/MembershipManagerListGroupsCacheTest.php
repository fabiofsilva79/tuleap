<?php
/**
 * Copyright (c) Enalean, 2013 - Present. All Rights Reserved.
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

use Mockery\Adapter\Phpunit\MockeryPHPUnitIntegration;
use Tuleap\ForgeConfigSandbox;

//phpcs:ignore PSR1.Classes.ClassDeclaration.MissingNamespace
class MembershipManagerListGroupsCacheTest extends \Tuleap\Test\PHPUnit\TestCase
{
    use MockeryPHPUnitIntegration;
    use ForgeConfigSandbox;

    protected $membership_manager;
    protected $driver;
    protected $user_finder;
    protected $user;
    protected $project_name = 'someProject';
    protected $project;
    protected $u_group;
    protected $git_repository;
    protected $gerrit_user;
    protected $gerrit_user_manager;
    protected $remote_server;
    protected $project_manager;

    protected function setUp(): void
    {
        parent::setUp();
        ForgeConfig::set('codendi_log', '/tmp/');
        $this->user                  = \Mockery::spy(\PFUser::class)->shouldReceive('getLdapId')->andReturns('whatever')->getMock();
        $this->driver                = \Mockery::spy(\Git_Driver_Gerrit::class);
        $this->driver_factory        = \Mockery::spy(\Git_Driver_Gerrit_GerritDriverFactory::class)->shouldReceive('getDriver')->andReturns($this->driver)->getMock();
        $this->user_finder           = \Mockery::spy(\Git_Driver_Gerrit_UserFinder::class);
        $this->remote_server_factory = \Mockery::spy(\Git_RemoteServer_GerritServerFactory::class);
        $this->remote_server         = \Mockery::spy(\Git_RemoteServer_GerritServer::class)->shouldReceive('getId')->andReturns(25)->getMock();
        $this->gerrit_user           = \Mockery::spy(\Git_Driver_Gerrit_User::class);
        $this->gerrit_user_manager   = \Mockery::spy(\Git_Driver_Gerrit_UserAccountManager::class);
        $this->project               = \Mockery::spy(\Project::class);
        $this->u_group               = \Mockery::spy(\ProjectUGroup::class);
        $this->u_group2              = \Mockery::spy(\ProjectUGroup::class);
        $this->u_group3              = \Mockery::spy(\ProjectUGroup::class);
        $this->git_repository        = \Mockery::spy(\GitRepository::class);
        $this->project_manager       = \Mockery::spy(\ProjectManager::class);

        $this->u_group->shouldReceive('getProject')->andReturns($this->project);
        $this->u_group2->shouldReceive('getProject')->andReturns($this->project);
        $this->u_group3->shouldReceive('getProject')->andReturns($this->project);
        $this->project_manager->shouldReceive('getChildProjects')->andReturns([]);

        $this->remote_server_factory->shouldReceive('getServer')->andReturns($this->remote_server);
        $this->project->shouldReceive('getUnixName')->andReturns($this->project_name);

        $this->gerrit_user_manager->shouldReceive('getGerritUser')->with($this->user)->andReturns($this->gerrit_user);

        $this->membership_manager = new Git_Driver_Gerrit_MembershipManager(
            \Mockery::spy(Git_Driver_Gerrit_MembershipDao::class),
            $this->driver_factory,
            $this->gerrit_user_manager,
            \Mockery::spy(\Git_RemoteServer_GerritServerFactory::class),
            \Mockery::spy(\Psr\Log\LoggerInterface::class),
            \Mockery::spy(\UGroupManager::class),
            $this->project_manager
        );
    }

    public function testItFetchesGroupsFromDriverOnlyOncePerServer(): void
    {
        $this->driver->shouldReceive('getAllGroups')->andReturns([])->once();
        $this->membership_manager->doesGroupExistOnServer($this->remote_server, $this->u_group);
        $this->membership_manager->doesGroupExistOnServer($this->remote_server, $this->u_group);
    }

    public function testItCachesSeveralServers(): void
    {
        $remote_server2 = \Mockery::spy(\Git_RemoteServer_GerritServer::class)->shouldReceive('getId')->andReturns(37)->getMock();

        $this->driver->shouldReceive('getAllGroups')->with($this->remote_server)->andReturns([])->once();
        $this->driver->shouldReceive('getAllGroups')->with($remote_server2)->andReturns([])->once();
        $this->membership_manager->doesGroupExistOnServer($this->remote_server, $this->u_group);
        $this->membership_manager->doesGroupExistOnServer($remote_server2, $this->u_group);
    }
}
