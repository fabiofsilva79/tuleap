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

import { ArtifactCrossReferenceStub } from "../../../../tests/stubs/ArtifactCrossReferenceStub";
import { NewLink } from "./NewLink";
import type { LinkType } from "./LinkType";
import { LinkableArtifactStub } from "../../../../tests/stubs/LinkableArtifactStub";

const ARTIFACT_ID = 88;
const TITLE = "thermonatrite";
const CROSS_REFERENCE = `release #${ARTIFACT_ID}`;
const COLOR = "lilac-purple";
const HTML_URI = "/plugins/tracker/?aid=" + ARTIFACT_ID;
const STATUS = "To do";

describe(`NewLink`, () => {
    it(`builds from a LinkableArtifact and a Type`, () => {
        const linkable_artifact = LinkableArtifactStub.withDefaults({
            id: ARTIFACT_ID,
            title: TITLE,
            xref: ArtifactCrossReferenceStub.withRefAndColor(CROSS_REFERENCE, COLOR),
            uri: HTML_URI,
            status: STATUS,
            is_open: true,
        });

        const link_type: LinkType = {
            shortname: "fixes",
            label: "Fixed in",
            direction: "forward",
        };

        const new_link = NewLink.fromLinkableArtifactAndType(linkable_artifact, link_type);

        expect(new_link.identifier.id).toBe(ARTIFACT_ID);
        expect(new_link.title).toBe(TITLE);
        expect(new_link.xref.ref).toBe(CROSS_REFERENCE);
        expect(new_link.xref.color).toBe(COLOR);
        expect(new_link.uri).toBe(HTML_URI);
        expect(new_link.status).toBe(STATUS);
        expect(new_link.is_open).toBe(true);
        expect(new_link.link_type).toStrictEqual(link_type);
    });
});
