/*
 * Copyright (c) Enalean, 2018-Present. All Rights Reserved.
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

const path = require("path");
const { webpack_configurator } = require("@tuleap/build-system-configurator");
const assets_dir_path = path.resolve(__dirname, "./frontend-assets");
const assets_public_path = "/assets/document/";
const MomentTimezoneDataPlugin = require("moment-timezone-data-webpack-plugin");

const entry_points = {
    document: "./scripts/document/index.js",
    "admin-search-view": "./scripts/admin-search-view/index.ts",
    "document-style": "./themes/document.scss",
};

module.exports = [
    {
        entry: entry_points,
        context: path.resolve(__dirname),
        output: webpack_configurator.configureOutput(assets_dir_path, assets_public_path),
        externals: {
            tlp: "tlp",
        },
        resolve: {
            extensions: [".ts", ".js", ".vue"],
            alias: {
                vue: path.resolve(__dirname, "node_modules", "vue"),
            },
        },
        module: {
            rules: [
                ...webpack_configurator.configureTypescriptRules(),
                webpack_configurator.rule_easygettext_loader,
                webpack_configurator.rule_vue_loader,
                webpack_configurator.rule_scss_loader,
                {
                    test: /new\.(docx|xlsx|pptx)/,
                    type: "asset/resource",
                },
            ],
        },
        plugins: [
            webpack_configurator.getCleanWebpackPlugin(),
            webpack_configurator.getManifestPlugin(),
            webpack_configurator.getTypescriptCheckerPlugin(true),
            webpack_configurator.getVueLoaderPlugin(),
            webpack_configurator.getMomentLocalePlugin(),
            new MomentTimezoneDataPlugin({
                startYear: 1970,
                endYear: new Date().getFullYear() + 1,
            }),
            ...webpack_configurator.getCSSExtractionPlugins(),
        ],
        resolveLoader: {
            alias: webpack_configurator.easygettext_loader_alias,
        },
    },
];
