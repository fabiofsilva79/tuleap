<?php
// @codingStandardsIgnoreFile
// @codeCoverageIgnoreStart
// this is an autogenerated file - do not edit
function autoloade9d403241b0f82fbae0318251f1a4625($class) {
    static $classes = null;
    if ($classes === null) {
        $classes = array(
            'botmattermost_agiledashboardplugin' => '/botmattermost_agiledashboardPlugin.class.php',
            'tuleap\\botmattermostagiledashboard\\botagiledashboard\\botagiledashboard' => '/BotMattermostAgileDashboard/BotAgileDashboard/BotAgileDashboard.php',
            'tuleap\\botmattermostagiledashboard\\botagiledashboard\\botagiledashboarddao' => '/BotMattermostAgileDashboard/BotAgileDashboard/BotAgileDashboardDao.php',
            'tuleap\\botmattermostagiledashboard\\botagiledashboard\\botagiledashboardfactory' => '/BotMattermostAgileDashboard/BotAgileDashboard/BotAgileDashboardFactory.php',
            'tuleap\\botmattermostagiledashboard\\controller' => '/BotMattermostAgileDashboard/Controller.php',
            'tuleap\\botmattermostagiledashboard\\plugin\\plugindescriptor' => '/BotMattermostAgileDashboard/Plugin/PluginDescriptor.php',
            'tuleap\\botmattermostagiledashboard\\plugin\\plugininfo' => '/BotMattermostAgileDashboard/Plugin/PluginInfo.php',
            'tuleap\\botmattermostagiledashboard\\presenter\\adminnotificationpresenter' => '/BotMattermostAgileDashboard/Presenter/AdminNotificationPresenter.php',
            'tuleap\\botmattermostagiledashboard\\senderservices\\standupnotificationbuilder' => '/BotMattermostAgileDashboard/SenderServices/StandUpNotificationBuilder.php',
            'tuleap\\botmattermostagiledashboard\\senderservices\\standupnotificationsender' => '/BotMattermostAgileDashboard/SenderServices/StandUpNotificationSender.php'
        );
    }
    $cn = strtolower($class);
    if (isset($classes[$cn])) {
        require dirname(__FILE__) . $classes[$cn];
    }
}
spl_autoload_register('autoloade9d403241b0f82fbae0318251f1a4625');
// @codeCoverageIgnoreEnd
