<?php
/**
 * Copyright (c) Enalean, 2022 - Present. All Rights Reserved.
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

namespace Tuleap\OnlyOffice\Open\Editor;

/**
 * @psalm-immutable
 * @see https://api.onlyoffice.com/editors/config/editor
 */
final class OnlyOfficeEditorConfig
{
    /**
     * Macros cannot be used with the Tuleap/ONLYOFFICE integration, it compromises Tuleap security
     * @see https://api.onlyoffice.com/editors/config/editor/customization#macrosMode
     */
    public array $customization = ['macros' => false, 'macrosMode' => 'disable', 'plugins' => false];

    private function __construct(
        public string $lang,
        public string $region,
        public OnlyOfficeEditorUserConfig $user,
        public string $callbackUrl,
    ) {
    }

    public static function fromUser(\PFUser $user, string $callback_url): self
    {
        return new self(
            $user->getShortLocale(),
            str_replace('_', '-', $user->getLocale()),
            OnlyOfficeEditorUserConfig::fromUser($user),
            $callback_url,
        );
    }
}
