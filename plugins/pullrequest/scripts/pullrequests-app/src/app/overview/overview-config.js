export default OverviewConfig;

OverviewConfig.$inject = ["$stateProvider"];

function OverviewConfig($stateProvider) {
    $stateProvider.state("overview", {
        url: "/overview",
        parent: "pull-request",
        views: {
            "overview@pull-request": {
                template: "<overview-wrapper></overview-wrapper>",
            },
            "timeline@overview": {
                template: '<div timeline id="timeline"></div>',
            },
            "reviewers@overview": {
                template: '<div reviewers id="reviewers"></div>',
            },
        },
    });
}
