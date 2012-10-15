<?php
/**
 * Copyright (c) STMicroelectronics, 2012. All Rights Reserved.
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

require_once 'common/project/UGroupBinding.class.php';

Mock::generate('UGroupBinding');
Mock::generatePartial('UGroupBinding', 'UGroupBindingTestVersion', array('getUGroupsByBindingSource'));
Mock::generate('UGroup');
Mock::generate('UGroupDao');
Mock::generate('UGroupUserDao');
Mock::generate('UGroupManager');
require_once('common/language/BaseLanguage.class.php');
Mock::generate('BaseLanguage');
require_once('common/include/Response.class.php');
Mock::generate('Response');

class UGroupBindingTest extends UnitTestCase {

    public function setUp() {
        $GLOBALS['Response'] = new MockResponse();
        $GLOBALS['Language'] = new MockBaseLanguage();
    }

    function tearDown() {
        unset($GLOBALS['Response']);
        unset($GLOBALS['Language']);
    }

    function testRemoveUgroupBinding() {
        $ugroup_id     = 200;
        $ugroupBinding = new UGroupBindingTestVersion();
        $ugroupDao     = new MockUGroupDao();
        $ugroupDao->setReturnValue('updateUgroupBinding', true);
        $ugroupBinding->ugroupdao = $ugroupDao;
        $GLOBALS['Language']->expectOnce('getText', array('project_ugroup_binding','binding_removed'));
        $GLOBALS['Response']->expectOnce('addFeedback');
        $this->assertTrue($ugroupBinding->removeBinding($ugroup_id));
    }

    function testResetUgroupFailureUpdateUGroupNotAllowed() {
        $ugroup_id     = 200;
        $ugroupBinding = new UGroupBindingTestVersion();
        $ugroupManager = new MockUGroupManager();
        $ugroupManager->setReturnValue('isUpdateUsersAllowed', false);
        $ugroupBinding->ugroupManager = $ugroupManager;
        $this->expectException(new RuntimeException());
        $ugroupBinding->resetUgroup($ugroup_id);
    }

    function testResetUgroupDaoFailure() {
        $ugroup_id     = 200;
        $ugroupBinding = new UGroupBindingTestVersion();
        $ugroupManager = new MockUGroupManager();
        $ugroupUserDao = new MockUGroupUserDao();
        $ugroupManager->setReturnValue('isUpdateUsersAllowed', true);
        $ugroupUserDao->setReturnValue('resetUgroupUserList', false);
        $ugroupBinding->ugroupManager = $ugroupManager;
        $ugroupBinding->ugroupUserDao = $ugroupUserDao;
        $this->expectException(new LogicException());
        $ugroupBinding->resetUgroup($ugroup_id);
    }

    function testCloneUgroupFailureUpdateUGroupNotAllowed() {
        $ugroup_id     = 200;
        $source_id     = 300;
        $ugroupBinding = new UGroupBindingTestVersion();
        $ugroupManager = new MockUGroupManager();
        $ugroupManager->setReturnValue('isUpdateUsersAllowed', false);
        $ugroupBinding->ugroupManager = $ugroupManager;
        $this->expectException(new RuntimeException());
        $ugroupBinding->cloneUgroup($source_id, $ugroup_id);
    }

    function testCloneUgroupDaoFailure() {
        $ugroup_id     = 200;
        $source_id     = 300;
        $ugroupBinding = new UGroupBindingTestVersion();
        $ugroupManager = new MockUGroupManager();
        $ugroupUserDao = new MockUGroupUserDao();
        $ugroupManager->setReturnValue('isUpdateUsersAllowed', true);
        $ugroupUserDao->setReturnValue('cloneUgroup', false);
        $ugroupBinding->ugroupManager = $ugroupManager;
        $ugroupBinding->ugroupUserDao = $ugroupUserDao;
        $this->expectException(new LogicException());
        $ugroupBinding->cloneUgroup($source_id, $ugroup_id);
    }

    function testUpdateUgroupBindingFailure() {
        $ugroup_id     = 200;
        $source_id     = 300;
        $ugroupBinding = new UGroupBindingTestVersion();
        $ugroupDao     = new MockUGroupDao();
        $ugroupDao->setReturnValue('updateUgroupBinding', false);
        $ugroupBinding->ugroupdao = $ugroupDao;
        $this->expectException(new Exception('Unable to store ugroup binding'));
        $ugroupBinding->updateUgroupBinding($ugroup_id, $source_id);
    }

    function testRemoveAllUGroupsBinding() {
        $ugroup_id     = 200;
        $bindedUgroups = array(300, 400, 500, 600);
        $ugroupBinding = new UGroupBindingTestVersion();
        $ugroupBinding->setReturnValue('getUGroupsByBindingSource', $bindedUgroups);
        $ugroupDao     = new MockUGroupDao();
        $ugroupBinding->ugroupdao = $ugroupDao;

        $ugroupDao->expectCallCount('updateUgroupBinding', 4);
        $ugroupDao->setReturnValueAt(0, 'updateUgroupBinding', true);
        $ugroupDao->setReturnValueAt(2, 'updateUgroupBinding', false);
        $this->assertFalse($ugroupBinding->removeAllUGroupsBinding($ugroup_id));
    }

}
?>