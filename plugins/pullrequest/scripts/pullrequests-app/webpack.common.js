/*
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

const path = require("path");
const { VueLoaderPlugin } = require("vue-loader");
const { webpack_configurator } = require("@tuleap/build-system-configurator");

module.exports = [
    {
        entry: {
            "tuleap-pullrequest": "./src/app/app.js",
            "pull-requests-style": "../../themes/pull-requests.scss",
        },
        context: path.resolve(__dirname),
        output: webpack_configurator.configureOutput(path.resolve(__dirname, "./frontend-assets/")),
        externals: {
            jquery: "jQuery",
            tlp: "tlp",
        },
        module: {
            rules: [
                ...webpack_configurator.configureTypescriptRules(),
                {
                    test: /\.vue$/,
                    exclude: /node_modules/,
                    loader: "vue-loader",
                },
                webpack_configurator.rule_ng_cache_loader,
                webpack_configurator.rule_angular_gettext_loader,
                webpack_configurator.rule_scss_loader,
                webpack_configurator.rule_css_assets,
            ],
        },
        plugins: [
            webpack_configurator.getCleanWebpackPlugin(),
            webpack_configurator.getManifestPlugin(),
            webpack_configurator.getMomentLocalePlugin(),
            new VueLoaderPlugin(),
            ...webpack_configurator.getCSSExtractionPlugins(),
        ],
        resolve: {
            extensions: [".ts", ".js", ".vue"],
            alias: {
                // deduplicate angular that is also used by angular-async
                angular$: path.resolve(__dirname, "./node_modules/angular"),
            },
        },
    },
];
