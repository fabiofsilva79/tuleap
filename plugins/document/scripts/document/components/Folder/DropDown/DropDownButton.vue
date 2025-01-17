<!--
  - Copyright (c) Enalean, 2019-Present. All Rights Reserved.
  -
  - This file is a part of Tuleap.
  -
  - Tuleap is free software; you can redistribute it and/or modify
  - it under the terms of the GNU General Public License as published by
  - the Free Software Foundation; either version 2 of the License, or
  - (at your option) any later version.
  -
  - Tuleap is distributed in the hope that it will be useful,
  - but WITHOUT ANY WARRANTY; without even the implied warranty of
  - MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
  - GNU General Public License for more details.
  -
  - You should have received a copy of the GNU General Public License
  - along with Tuleap. If not, see http://www.gnu.org/licenses/.
  -
  -->

<template>
    <div class="tlp-dropdown document-dropdown-menu-button">
        <button
            class="tlp-button-primary"
            v-bind:class="{
                'tlp-button-large': isInLargeMode,
                'tlp-button-small tlp-button-outline': isInQuickLookMode,
                'tlp-append tlp-dropdown-split-button-caret': isAppended,
                'tlp-button-ellipsis': !isAppended,
            }"
            ref="dropdownButton"
            type="button"
            data-test="document-drop-down-button"
            v-bind:aria-label="$gettext(`Open dropdown menu`)"
        >
            <i v-if="isAppended" class="fa-solid fa-caret-down" aria-hidden="true"></i>
            <i v-else class="fa-solid fa-ellipsis" aria-hidden="true"></i>
        </button>
        <div class="tlp-dropdown-menu document-dropdown-menu" role="menu">
            <slot></slot>
        </div>
    </div>
</template>

<script lang="ts">
import type { Dropdown } from "@tuleap/tlp-dropdown";
import {
    createDropdown,
    EVENT_TLP_DROPDOWN_SHOWN,
    EVENT_TLP_DROPDOWN_HIDDEN,
} from "@tuleap/tlp-dropdown";
import { EVENT_TLP_MODAL_SHOWN } from "@tuleap/tlp-modal";
import emitter from "../../../helpers/emitter";
import { Component, Prop, Vue } from "vue-property-decorator";

@Component
export default class DropDownButton extends Vue {
    @Prop({ required: true })
    readonly isInLargeMode!: boolean;

    @Prop({ required: true })
    readonly isInQuickLookMode!: boolean;

    @Prop({ required: true })
    readonly isAppended!: boolean;

    private dropdown: null | Dropdown = null;

    mounted() {
        const dropdownButton = this.$refs.dropdownButton;
        if (!(dropdownButton instanceof Element)) {
            return;
        }

        this.dropdown = createDropdown(dropdownButton);

        this.dropdown.addEventListener(EVENT_TLP_DROPDOWN_SHOWN, this.showDropdownEvent);
        this.dropdown.addEventListener(EVENT_TLP_DROPDOWN_HIDDEN, this.hideDropdownEvent);
        document.addEventListener(EVENT_TLP_MODAL_SHOWN, this.hideActionMenu);

        emitter.on("hide-action-menu", this.hideActionMenu);
    }
    beforeDestroy() {
        document.removeEventListener(EVENT_TLP_MODAL_SHOWN, this.hideActionMenu);

        emitter.off("hide-action-menu", this.hideActionMenu);
        if (!this.dropdown) {
            return;
        }
        this.dropdown.removeEventListener(EVENT_TLP_DROPDOWN_SHOWN, this.showDropdownEvent);
        this.dropdown.removeEventListener(EVENT_TLP_DROPDOWN_HIDDEN, this.hideDropdownEvent);
    }

    hideActionMenu(): void {
        if (this.dropdown && this.dropdown.is_shown) {
            this.dropdown.hide();
        }
    }
    showDropdownEvent(): void {
        emitter.emit("set-dropdown-shown", { is_dropdown_shown: true });
        this.$emit("dropdown-shown");
    }
    hideDropdownEvent(): void {
        emitter.emit("set-dropdown-shown", { is_dropdown_shown: false });
        this.$emit("dropdown-hidden");
    }
}
</script>
