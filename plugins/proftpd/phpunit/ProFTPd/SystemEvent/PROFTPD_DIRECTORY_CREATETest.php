<?php
/**
 * Copyright Enalean (c) 2011, 2012, 2013. All rights reserved.
 *
 * Tuleap and Enalean names and logos are registrated trademarks owned by
 * Enalean SAS. All other trademarks or names are properties of their respective
 * owners.
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

require_once dirname(__FILE__).'/../../bootstrap.php';

class SystemEvent_PROFTPD_DIRECTORY_CREATETest extends PHPUnit_Framework_TestCase {
    /** @var SystemEvent_PROFTPD_DIRECTORY_CREATE */
    private $event;
    /** @var String */
    private $path;
    /** @var String */
    private $group_unix_name;
    /** @var String */
    private $ftp_directory;

    public function setUp() {
        parent::setUp();
        $this->event   = $this->getMockBuilder('Tuleap\ProFTPd\SystemEvent\PROFTPD_DIRECTORY_CREATE')->setMethods(array('done'))->disableOriginalConstructor()->getMock();
        $this->backend = $this->getMockBuilder('Backend')->disableOriginalConstructor()->getMock();

        $this->group_unix_name = "group_name";
        $this->ftp_directory = '/var/tmp';
        $this->path = $this->ftp_directory . "/" . $this->group_unix_name;

        $GLOBALS['sys_http_user'] = 'someuser';

        $this->event->setParameters($this->group_unix_name);
        $this->event->injectDependencies($this->backend, $this->ftp_directory);
    }

    public function tearDown() {
        rmdir($this->path);
    }

    public function testItCreatesDirectory() {
        $this->event->process();
        $this->assertTrue(file_exists($this->path));
    }

    public function testItSetsPermissionsOnDirectory() {
        $this->backend->expects($this->once())->method('changeOwnerGroupMode')->with(
            $this->path,
            "dummy",
            $this->group_unix_name,
            0700
        );

        $this->event->process();
    }

    public function testItSetsACLOnDirectory() {
        $this->backend->expects($this->at(1))->method('setfacl')->with('d:u:'.$GLOBALS['sys_http_user'].':rx', $this->path);
        $this->backend->expects($this->at(2))->method('setfacl')->with('u:'.$GLOBALS['sys_http_user'].':rx', $this->path);

        $this->event->process();
    }

    public function testItMarkProcessAsDone() {
        $this->event->expects($this->once())->method('done');
        $this->event->process();
    }
}
