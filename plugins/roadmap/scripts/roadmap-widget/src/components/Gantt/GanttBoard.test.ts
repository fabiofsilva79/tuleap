/**
 * Copyright (c) Enalean, 2021 - present. All Rights Reserved.
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

import { shallowMount } from "@vue/test-utils";
import GanttBoard from "./GanttBoard.vue";
import type { Iteration, Row, Task } from "../../type";
import GanttTask from "./Task/GanttTask.vue";
import TimePeriodHeader from "./TimePeriod/TimePeriodHeader.vue";
import { TimePeriodMonth } from "../../helpers/time-period-month";
import TimePeriodControl from "./TimePeriod/TimePeriodControl.vue";
import ScrollingArea from "./ScrollingArea.vue";
import { createStoreMock } from "../../../../../../../src/scripts/vue-components/store-wrapper-jest";
import type { RootState } from "../../store/type";
import type { TasksState } from "../../store/tasks/type";
import SubtaskSkeletonBar from "./Subtask/SubtaskSkeletonBar.vue";
import SubtaskSkeletonHeader from "./Subtask/SubtaskSkeletonHeader.vue";
import SubtaskHeader from "./Subtask/SubtaskHeader.vue";
import SubtaskMessage from "./Subtask/SubtaskMessage.vue";
import BarPopover from "./Task/BarPopover.vue";
import SubtaskMessageHeader from "./Subtask/SubtaskMessageHeader.vue";
import type { IterationsState } from "../../store/iterations/type";
import IterationsRibbon from "./Iteration/IterationsRibbon.vue";

window.ResizeObserver =
    window.ResizeObserver ||
    jest.fn().mockImplementation(() => ({
        disconnect: jest.fn(),
        observe: jest.fn(),
        unobserve: jest.fn(),
    }));

function getRootState(): RootState {
    return {
        now: new Date(2020, 3, 15),
        locale_bcp47: "en-US",
        should_load_lvl1_iterations: false,
        should_load_lvl2_iterations: false,
        should_display_error_state: false,
        should_display_empty_state: false,
        is_loading: false,
        error_message: "",
        iterations: {
            lvl1_iterations: [],
            lvl2_iterations: [],
        } as IterationsState,
        tasks: {} as TasksState,
        timeperiod: {
            timescale: "month",
        },
    } as RootState;
}

describe("GanttBoard", () => {
    const windowResizeObserver = window.ResizeObserver;

    afterEach(() => {
        window.ResizeObserver = windowResizeObserver;
    });

    it("Displays no iterations if there isn't any", () => {
        const wrapper = shallowMount(GanttBoard, {
            propsData: {
                visible_natures: [],
            },
            mocks: {
                $store: createStoreMock({
                    state: getRootState(),
                    getters: {
                        "tasks/rows": [],
                        "tasks/tasks": [],
                    },
                }),
            },
        });

        expect(wrapper.findAllComponents(IterationsRibbon).length).toBe(0);
    });

    it("Displays level 1 iterations", () => {
        const root_state = getRootState();

        const wrapper = shallowMount(GanttBoard, {
            propsData: {
                visible_natures: [],
            },
            mocks: {
                $store: createStoreMock({
                    state: {
                        ...root_state,
                        iterations: {
                            ...root_state.iterations,
                            lvl1_iterations: [{ id: 1 } as Iteration],
                        },
                    },
                    getters: {
                        "tasks/rows": [],
                        "tasks/tasks": [],
                    },
                }),
            },
        });

        expect(wrapper.findAllComponents(IterationsRibbon).length).toBe(1);
    });

    it("Displays level 2 iterations", () => {
        const root_state = getRootState();

        const wrapper = shallowMount(GanttBoard, {
            propsData: {
                visible_natures: [],
            },
            mocks: {
                $store: createStoreMock({
                    state: {
                        ...root_state,
                        iterations: {
                            ...root_state.iterations,
                            lvl2_iterations: [{ id: 1 } as Iteration],
                        },
                    },
                    getters: {
                        "tasks/rows": [],
                        "tasks/tasks": [],
                    },
                }),
            },
        });

        expect(wrapper.findAllComponents(IterationsRibbon).length).toBe(1);
    });

    it("Displays levels 1 & 2 iterations", () => {
        const root_state = getRootState();

        const wrapper = shallowMount(GanttBoard, {
            propsData: {
                visible_natures: [],
            },
            mocks: {
                $store: createStoreMock({
                    state: {
                        ...root_state,
                        iterations: {
                            ...root_state.iterations,
                            lvl1_iterations: [{ id: 1 } as Iteration],
                            lvl2_iterations: [{ id: 2 } as Iteration],
                        },
                    },
                    getters: {
                        "tasks/rows": [],
                        "tasks/tasks": [],
                    },
                }),
            },
        });

        expect(wrapper.findAllComponents(IterationsRibbon).length).toBe(2);
    });

    it("Displays all tasks", () => {
        const wrapper = shallowMount(GanttBoard, {
            propsData: {
                visible_natures: [],
            },
            mocks: {
                $store: createStoreMock({
                    state: getRootState(),
                    getters: {
                        "tasks/rows": [
                            { task: { id: 1, dependencies: {} } as Task },
                            { task: { id: 2, dependencies: {} } as Task },
                            { task: { id: 3, dependencies: {} } as Task },
                        ],
                        "tasks/tasks": [
                            { id: 1, dependencies: {} } as Task,
                            { id: 2, dependencies: {} } as Task,
                            { id: 3, dependencies: {} } as Task,
                        ],
                        "timeperiod/time_period": new TimePeriodMonth(
                            new Date("2020-03-31T22:00:00.000Z"),
                            new Date("2020-04-31T22:00:00.000Z"),
                            "en-US"
                        ),
                    },
                }),
            },
        });

        expect(wrapper.findAllComponents(GanttTask).length).toBe(3);
    });

    it("Displays subtasks skeleton", () => {
        const wrapper = shallowMount(GanttBoard, {
            propsData: {
                visible_natures: [],
            },
            mocks: {
                $store: createStoreMock({
                    state: getRootState(),
                    getters: {
                        "tasks/rows": [
                            { task: { id: 1, dependencies: {} } as Task },
                            {
                                for_task: { id: 1, dependencies: {} } as Task,
                                is_skeleton: true,
                                is_last_one: true,
                            },
                            { task: { id: 3, dependencies: {} } as Task },
                        ],
                        "tasks/tasks": [
                            { id: 1, dependencies: {} } as Task,
                            { id: 3, dependencies: {} } as Task,
                        ],
                        "timeperiod/time_period": new TimePeriodMonth(
                            new Date("2020-03-31T22:00:00.000Z"),
                            new Date("2020-04-31T22:00:00.000Z"),
                            "en-US"
                        ),
                    },
                }),
            },
        });

        expect(wrapper.findAllComponents(GanttTask).length).toBe(2);
        expect(wrapper.findAllComponents(SubtaskSkeletonBar).length).toBe(1);
        expect(wrapper.findAllComponents(SubtaskSkeletonHeader).length).toBe(1);
    });

    it("Displays subtasks", () => {
        const wrapper = shallowMount(GanttBoard, {
            propsData: {
                visible_natures: [],
            },
            mocks: {
                $store: createStoreMock({
                    state: getRootState(),
                    getters: {
                        "tasks/rows": [
                            { task: { id: 1, dependencies: {} } as Task },
                            {
                                parent: { id: 1, dependencies: {} } as Task,
                                subtask: { id: 11, dependencies: {} } as Task,
                                is_last_one: true,
                            },
                            { task: { id: 3, dependencies: {} } as Task },
                        ] as Row[],
                        "tasks/tasks": [
                            { id: 1, dependencies: {} } as Task,
                            { id: 11, dependencies: {} } as Task,
                            { id: 3, dependencies: {} } as Task,
                        ],
                        "timeperiod/time_period": new TimePeriodMonth(
                            new Date("2020-03-31T22:00:00.000Z"),
                            new Date("2020-04-31T22:00:00.000Z"),
                            "en-US"
                        ),
                    },
                }),
            },
        });

        expect(wrapper.findAllComponents(GanttTask).length).toBe(3);
        expect(wrapper.findAllComponents(SubtaskHeader).length).toBe(1);
    });

    it("Displays subtasks that can have multiple parents", () => {
        const wrapper = shallowMount(GanttBoard, {
            propsData: {
                visible_natures: [],
            },
            mocks: {
                $store: createStoreMock({
                    state: getRootState(),
                    getters: {
                        "tasks/rows": [
                            { task: { id: 1, dependencies: {} } as Task },
                            {
                                parent: { id: 1, dependencies: {} } as Task,
                                subtask: { id: 11, dependencies: {} } as Task,
                                is_last_one: true,
                            },
                            { task: { id: 3, dependencies: {} } as Task },
                            {
                                parent: { id: 3, dependencies: {} } as Task,
                                subtask: { id: 11, dependencies: {} } as Task,
                                is_last_one: true,
                            },
                        ] as Row[],
                        "tasks/tasks": [
                            { id: 1, dependencies: {} } as Task,
                            { id: 11, dependencies: {} } as Task,
                            { id: 3, dependencies: {} } as Task,
                            { id: 11, dependencies: {} } as Task,
                        ],
                        "timeperiod/time_period": new TimePeriodMonth(
                            new Date("2020-03-31T22:00:00.000Z"),
                            new Date("2020-04-31T22:00:00.000Z"),
                            "en-US"
                        ),
                    },
                }),
            },
        });

        expect(wrapper.findAllComponents(GanttTask).length).toBe(4);
        expect(wrapper.findAllComponents(SubtaskHeader).length).toBe(2);

        const popover_ids = wrapper
            .findAllComponents(BarPopover)
            .wrappers.map((wrapper) => wrapper.element.id);
        const unique_popover_ids = popover_ids.filter(
            (id, index, ids) => ids.indexOf(id) === index
        );
        expect(unique_popover_ids.length).toBe(4);
    });

    it("Displays subtasks error message if retrieval failed", () => {
        const wrapper = shallowMount(GanttBoard, {
            propsData: {
                visible_natures: [],
            },
            mocks: {
                $store: createStoreMock({
                    state: getRootState(),
                    getters: {
                        "tasks/rows": [
                            { task: { id: 1, dependencies: {} } as Task },
                            {
                                for_task: { id: 1, dependencies: {} } as Task,
                                is_error: true,
                            },
                            { task: { id: 3, dependencies: {} } as Task },
                        ] as Row[],
                        "tasks/tasks": [
                            { id: 1, dependencies: {} } as Task,
                            { id: 3, dependencies: {} } as Task,
                        ],
                        "timeperiod/time_period": new TimePeriodMonth(
                            new Date("2020-03-31T22:00:00.000Z"),
                            new Date("2020-04-31T22:00:00.000Z"),
                            "en-US"
                        ),
                    },
                }),
            },
        });

        expect(wrapper.findAllComponents(GanttTask).length).toBe(2);
        expect(wrapper.findAllComponents(SubtaskMessageHeader).length).toBe(1);
        expect(wrapper.findAllComponents(SubtaskMessage).length).toBe(1);
    });

    it("Displays subtasks empty message if retrieval returned no subtasks", () => {
        const wrapper = shallowMount(GanttBoard, {
            propsData: {
                visible_natures: [],
            },
            mocks: {
                $store: createStoreMock({
                    state: getRootState(),
                    getters: {
                        "tasks/rows": [
                            { task: { id: 1, dependencies: {} } as Task },
                            {
                                for_task: { id: 1, dependencies: {} } as Task,
                                is_empty: true,
                            },
                            { task: { id: 3, dependencies: {} } as Task },
                        ] as Row[],
                        "tasks/tasks": [
                            { id: 1, dependencies: {} } as Task,
                            { id: 3, dependencies: {} } as Task,
                        ],
                        "timeperiod/time_period": new TimePeriodMonth(
                            new Date("2020-03-31T22:00:00.000Z"),
                            new Date("2020-04-31T22:00:00.000Z"),
                            "en-US"
                        ),
                    },
                }),
            },
        });

        expect(wrapper.findAllComponents(GanttTask).length).toBe(2);
        expect(wrapper.findAllComponents(SubtaskMessageHeader).length).toBe(1);
        expect(wrapper.findAllComponents(SubtaskMessage).length).toBe(1);
    });

    it("Observes the resize of the time period", () => {
        const observe = jest.fn();
        const mockResizeObserver = jest.fn();
        mockResizeObserver.mockReturnValue({
            observe,
        });
        window.ResizeObserver = mockResizeObserver;

        const task_1 = {
            id: 1,
            start: new Date(2020, 3, 15),
            dependencies: {},
        } as Task;
        const task_2 = {
            id: 2,
            start: new Date(2020, 3, 20),
            dependencies: {},
        } as Task;
        const wrapper = shallowMount(GanttBoard, {
            propsData: {
                visible_natures: [],
            },
            mocks: {
                $store: createStoreMock({
                    state: getRootState(),
                    getters: {
                        "tasks/rows": [
                            {
                                task: task_1,
                            },
                            {
                                task: task_2,
                            },
                        ],
                        "tasks/tasks": [task_1, task_2],
                        "timeperiod/time_period": new TimePeriodMonth(
                            new Date("2020-03-31T22:00:00.000Z"),
                            new Date("2020-04-31T22:00:00.000Z"),
                            "en-US"
                        ),
                    },
                }),
            },
        });

        const time_period = wrapper.findComponent(TimePeriodHeader);
        expect(time_period.exists()).toBe(true);
        expect(observe).toHaveBeenCalledWith(time_period.element);
    });

    it("Fills the empty space of additional months if the user resize the viewport", async () => {
        const observe = jest.fn();
        const mockResizeObserver = jest.fn();
        mockResizeObserver.mockReturnValue({
            observe,
        });
        window.ResizeObserver = mockResizeObserver;

        const task_1 = {
            id: 1,
            start: new Date(2020, 3, 15),
            dependencies: {},
        } as Task;
        const task_2 = {
            id: 2,
            start: new Date(2020, 3, 20),
            dependencies: {},
        } as Task;
        const wrapper = shallowMount(GanttBoard, {
            propsData: {
                visible_natures: [],
            },
            mocks: {
                $store: createStoreMock({
                    state: getRootState(),
                    getters: {
                        "tasks/rows": [
                            {
                                task: task_1,
                            },
                            {
                                task: task_2,
                            },
                        ],
                        "tasks/tasks": [task_1, task_2],
                        "timeperiod/time_period": new TimePeriodMonth(
                            new Date("2020-03-31T22:00:00.000Z"),
                            new Date("2020-04-31T22:00:00.000Z"),
                            "en-US"
                        ),
                    },
                }),
            },
        });

        const time_period_header = wrapper.findComponent(TimePeriodHeader);
        expect(time_period_header.exists()).toBe(true);
        expect(time_period_header.props("nb_additional_units")).toBe(0);

        const observerCallback = mockResizeObserver.mock.calls[0][0];
        await observerCallback([
            {
                contentRect: { width: 550 } as DOMRectReadOnly,
                target: time_period_header.element,
            } as unknown as ResizeObserverEntry,
        ]);

        expect(time_period_header.props("nb_additional_units")).toBe(1);
    });

    it("Use a different time period if user chose a different timescale", async () => {
        const wrapper = shallowMount(GanttBoard, {
            propsData: {
                visible_natures: [],
            },
            mocks: {
                $store: createStoreMock({
                    state: getRootState(),
                    getters: {
                        "tasks/rows": [
                            { task: { id: 1, dependencies: {} } as Task },
                            { task: { id: 2, dependencies: {} } as Task },
                            { task: { id: 3, dependencies: {} } as Task },
                        ],
                        "tasks/tasks": [
                            { id: 1, dependencies: {} } as Task,
                            { id: 2, dependencies: {} } as Task,
                            { id: 3, dependencies: {} } as Task,
                        ],
                        "timeperiod/time_period": new TimePeriodMonth(
                            new Date("2020-03-31T22:00:00.000Z"),
                            new Date("2020-04-31T22:00:00.000Z"),
                            "en-US"
                        ),
                    },
                }),
            },
        });

        await wrapper.findComponent(TimePeriodControl).vm.$emit("input", "quarter");
        expect(wrapper.vm.$store.commit).toHaveBeenCalledWith("timeperiod/setTimescale", "quarter");
    });

    it("switch is-scrolling class on header so that user is knowing that some data is hidden behind the header", async () => {
        const wrapper = shallowMount(GanttBoard, {
            propsData: {
                visible_natures: [],
            },
            mocks: {
                $store: createStoreMock({
                    state: getRootState(),
                    getters: {
                        "tasks/rows": [
                            { task: { id: 1, dependencies: {} } as Task },
                            { task: { id: 2, dependencies: {} } as Task },
                            { task: { id: 3, dependencies: {} } as Task },
                        ],
                        "tasks/tasks": [
                            { id: 1, dependencies: {} } as Task,
                            { id: 2, dependencies: {} } as Task,
                            { id: 3, dependencies: {} } as Task,
                        ],
                        "timeperiod/time_period": new TimePeriodMonth(
                            new Date("2020-03-31T22:00:00.000Z"),
                            new Date("2020-04-31T22:00:00.000Z"),
                            "en-US"
                        ),
                    },
                }),
            },
        });

        const header = wrapper.find("[data-test=gantt-header]");
        expect(header.classes()).not.toContain("roadmap-gantt-header-is-scrolling");

        await wrapper.findComponent(ScrollingArea).vm.$emit("is_scrolling", true);
        expect(header.classes()).toContain("roadmap-gantt-header-is-scrolling");

        await wrapper.findComponent(ScrollingArea).vm.$emit("is_scrolling", false);
        expect(header.classes()).not.toContain("roadmap-gantt-header-is-scrolling");
    });
});
