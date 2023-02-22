/*
 * Copyright (c) Enalean, 2022-Present. All Rights Reserved.
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

export interface GettextProvider {
    gettext(msgid: string): string;
    ngettext(singular: string, plural: string, n: number): string;
}

// See https://github.com/smhg/gettext-parser for the file format reference
interface Translation {
    readonly msgid: string;
    readonly msgstr: string;
}

interface TranslatedStrings {
    readonly [key: string]: Translation;
}

interface Contexts {
    readonly [key: string]: TranslatedStrings;
}

export interface GettextParserPoFile {
    readonly headers?: {
        readonly [key: string]: string;
    };
    readonly translations: Contexts;
}
