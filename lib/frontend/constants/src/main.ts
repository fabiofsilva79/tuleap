/*
 * Copyright (c) Enalean, 2019-Present. All Rights Reserved.
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

export const PROJECT_MEMBERS_ID = 3;
export const PROJECT_ADMINISTRATORS_ID = 4;

type DateFormat = "d/m/Y" | "Y-m-d";
type DateWithTimeFormat = "d/m/Y H:i" | "Y-m-d H:i";
export type DateTimeFormat = DateFormat | DateWithTimeFormat;
export const en_US_DATE_TIME_FORMAT = "Y-m-d H:i";
export const en_US_DATE_FORMAT = "Y-m-d";
export const fr_FR_DATE_TIME_FORMAT = "d/m/Y H:i";
export const fr_FR_DATE_FORMAT = "d/m/Y";

export type LocaleString = "fr_FR" | "en_US" | "pt_BR";
export const en_US_LOCALE = "en_US";
export const fr_FR_LOCALE = "fr_FR";
export const pt_BR_LOCALE = "pt_BR";
