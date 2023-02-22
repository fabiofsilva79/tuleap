/*
 * Copyright (c) Enalean, 2020 - present. All Rights Reserved.
 *
 *  This file is a part of Tuleap.
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
 *
 */

describe("Cross tracker search", function () {
    let now: number;

    before(function () {
        now = Date.now();
    });

    it("User should be able to set trackers from widgets", function () {
        cy.projectMemberSession();

        cy.createNewPublicProject(`x-tracker-${now}`, "agile_alm").then((project_id) => {
            cy.getTrackerIdFromREST(project_id, "bug").then((tracker_id) => {
                cy.createArtifact({
                    tracker_id: tracker_id,
                    artifact_title: "bug",
                    artifact_status: "New",
                    title_field_name: "summary",
                });
                cy.createArtifact({
                    tracker_id: tracker_id,
                    artifact_title: "bug 1",
                    artifact_status: "New",
                    title_field_name: "summary",
                });
                cy.createArtifact({
                    tracker_id: tracker_id,
                    artifact_title: "bug 2",
                    artifact_status: "In Progress",
                    title_field_name: "summary",
                });
            });
            cy.getTrackerIdFromREST(project_id, "task").then((tracker_id) => {
                cy.createArtifact({
                    tracker_id: tracker_id,
                    artifact_title: "nananana",
                    artifact_status: "Todo",
                    title_field_name: "title",
                });
                cy.createArtifact({
                    tracker_id: tracker_id,
                    artifact_title: "kanban 1",
                    artifact_status: "Done",
                    title_field_name: "title",
                });
                cy.createArtifact({
                    tracker_id: tracker_id,
                    artifact_title: "kanban 2",
                    artifact_status: "Todo",
                    title_field_name: "title",
                });
            });
        });

        cy.visit("/my/");

        cy.get("[data-test=dashboard-add-button]").click();
        cy.get("[data-test=dashboard-add-input-name]").type(`tab-${now}`);
        cy.get("[data-test=dashboard-add-button-submit]").click();

        cy.get("[data-test=dashboard-configuration-button]").click();
        cy.get("[data-test=dashboard-add-widget-button]").click();
        cy.get("[data-test=crosstrackersearch]").click();
        cy.get("[data-test=dashboard-add-widget-button-submit]").click();

        cy.log("select some trackers");
        cy.get("[data-test=cross-tracker-reading-mode]").click();

        cy.log("select project");
        cy.get("[data-test=cross-tracker-selector-project]").select(`x-tracker-${now}`);

        cy.get("[data-test=cross-tracker-selector-tracker]").select("Bugs");
        cy.get("[data-test=cross-tracker-selector-tracker-button]").click();
        cy.get("[data-test=cross-tracker-selector-tracker]").select("Tasks");
        cy.get("[data-test=cross-tracker-selector-tracker-button]").click();
        cy.intercept("/api/v1/cross_tracker_reports/*/content*").as("getReportContent");
        cy.get("[data-test=search-report-button]").click();

        cy.log("Bugs has some artifacts");
        cy.wait("@getReportContent", { timeout: 5000 });
        cy.get("[data-test=cross-tracker-results]").find("tr").should("have.length", 5);
        assertOpenArtifacts();

        cy.log("Regular user should be able to execute queries");
        updateSearchQuery("@title != 'foo'");
        cy.wait("@getReportContent", { timeout: 5000 });
        cy.get("[data-test=cross-tracker-results]").find("tr").should("have.length", 6);
        assertAllArtifacts();

        updateSearchQuery("@status = OPEN()");
        cy.wait("@getReportContent", { timeout: 5000 });
        cy.get("[data-test=cross-tracker-results]").find("tr").should("have.length", 5);
        assertOpenArtifacts();

        updateSearchQuery("@submitted_on BETWEEN(NOW() - 2m, NOW() - 1m)");
        cy.get("[data-test=cross-tracker-no-results]");

        updateSearchQuery('@last_update_date > "2018-01-01"');
        cy.wait("@getReportContent", { timeout: 5000 });
        cy.get("[data-test=cross-tracker-results]").find("tr").should("have.length", 6);
        assertAllArtifacts();

        cy.log("Save results");
        cy.get("[data-test=cross-tracker-save-report]").click();
        cy.get("[data-test=cross-tracker-report-success]");

        cy.log("reload page and check report still has results");
        cy.reload();
        cy.wait("@getReportContent", { timeout: 5000 });
        cy.get("[data-test=cross-tracker-results]").find("tr").should("have.length", 6);
        assertAllArtifacts();
    });
});

function updateSearchQuery(search_query: string): void {
    cy.get("[data-test=cross-tracker-reading-mode]").click();

    clearCodeMirror();
    // ignore for code mirror
    // eslint-disable-next-line cypress/require-data-selectors
    cy.get(".CodeMirror-code").type(search_query);
    cy.get("[data-test=search-report-button]").click();
    cy.get("[data-test=tql-reading-mode-query]").contains(search_query);
}

function assertOpenArtifacts(): void {
    cy.get("[data-test=cross-tracker-results-artifact]").then((artifact) => {
        cy.wrap(artifact).should("contain", "nananana");
        cy.wrap(artifact).should("contain", "kanban 2");
        cy.wrap(artifact).should("contain", "bug");
        cy.wrap(artifact).should("contain", "bug 1");
        cy.wrap(artifact).should("contain", "bug 2");
    });
}

function assertAllArtifacts(): void {
    cy.get("[data-test=cross-tracker-results-artifact]").then((artifact) => {
        cy.wrap(artifact).should("contain", "nananana");
        cy.wrap(artifact).should("contain", "kanban 2");
        cy.wrap(artifact).should("contain", "kanban 1");
        cy.wrap(artifact).should("contain", "bug");
        cy.wrap(artifact).should("contain", "bug 1");
        cy.wrap(artifact).should("contain", "bug 2");
    });
}

function clearCodeMirror(): void {
    // ignore for code mirror
    // eslint-disable-next-line cypress/require-data-selectors
    cy.get(".CodeMirror").then((el) => {
        const unwrap = Cypress.dom.unwrap(el)[0];
        unwrap.CodeMirror.setValue("");
    });
}
