import { RelativeDateHelper } from "../../helpers/date-helpers";
import { buildVueOverviewURL } from "../../helpers/vue-overview-url-builder";

export default PullRequestSummaryController;

PullRequestSummaryController.$inject = [
    "$state",
    "PullRequestService",
    "UserRestService",
    "SharedPropertiesService",
];

function PullRequestSummaryController(
    $state,
    PullRequestService,
    UserRestService,
    SharedPropertiesService
) {
    const self = this;

    Object.assign(self, {
        author: {},

        $onInit: init,
        goToOverview,
        isAbandoned,
        isMerged,
        relative_date_helper: RelativeDateHelper(
            SharedPropertiesService.getDateTimeFormat(),
            SharedPropertiesService.getRelativeDateDisplay(),
            SharedPropertiesService.getUserLocale()
        ),
    });

    function init() {
        UserRestService.getUser(self.pull_request.user_id).then((user) => {
            self.author = user;
        });
    }

    function isAbandoned() {
        return self.pull_request.status === PullRequestService.valid_status_keys.abandon;
    }

    function isMerged() {
        return self.pull_request.status === PullRequestService.valid_status_keys.merge;
    }

    function goToOverview() {
        if (SharedPropertiesService.isVueOverviewShown()) {
            window.location.assign(
                buildVueOverviewURL(window.location, self.pull_request).toString()
            );
            return;
        }

        $state.go("overview", { id: self.pull_request.id });
    }
}
