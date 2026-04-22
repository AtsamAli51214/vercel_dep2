import { type App } from "vue";
import type { PrimeVueLocaleOptions } from "@primevue/core/config";
import Aura from "@primeuix/themes/aura";
import PrimeVue from "primevue/config";
import enLocaleFile from "primelocale/en.json";
import nlLocaleFile from "primelocale/nl.json";
import AutoComplete from "primevue/autocomplete";
import Accordion from "primevue/accordion";
import Avatar from "primevue/avatar";
import AvatarGroup from "primevue/avatargroup";
import Badge from "primevue/badge";
import BadgeDirective from "primevue/badgedirective";
import BlockUI from "primevue/blockui";
import Button from "primevue/button";
import Breadcrumb from "primevue/breadcrumb";
import DatePicker from "primevue/datepicker";
import Card from "primevue/card";
import Checkbox from "primevue/checkbox";
import CheckboxGroup from "primevue/checkboxgroup";
import Column from "primevue/column";
import ConfirmDialog from "primevue/confirmdialog";
import ConfirmPopup from "primevue/confirmpopup";
import ConfirmationService from "primevue/confirmationservice";
import ContextMenu from "primevue/contextmenu";
import Chip from "primevue/chip";
import DataTable from "primevue/datatable";
import DataView from "primevue/dataview";
import DeferredContent from "primevue/deferredcontent";
import Dialog from "primevue/dialog";
import DialogService from "primevue/dialogservice";
import Divider from "primevue/divider";
import Dock from "primevue/dock";
import draggable from "vuedraggable";
import Select from "primevue/select";
import DynamicDialog from "primevue/dynamicdialog";
import Fieldset from "primevue/fieldset";
import FileUpload from "primevue/fileupload";
import Galleria from "primevue/galleria";
import Image from "primevue/image";
import Inplace from "primevue/inplace";
import InputText from "primevue/inputtext";
import InputMask from "primevue/inputmask";
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import InputNumber from "primevue/inputnumber";
import InputGroup from "primevue/inputgroup";
import InputGroupAddon from "primevue/inputgroupaddon";
import Knob from "primevue/knob";
import Listbox from "primevue/listbox";
import MegaMenu from "primevue/megamenu";
import Menu from "primevue/menu";
import Menubar from "primevue/menubar";
import Message from "primevue/message";
import MultiSelect from "primevue/multiselect";
import OrderList from "primevue/orderlist";
import OrganizationChart from "primevue/organizationchart";
import Paginator from "primevue/paginator";
import Panel from "primevue/panel";
import PanelMenu from "primevue/panelmenu";
import Password from "primevue/password";
import PickList from "primevue/picklist";
import Popover from "primevue/popover";
import ProgressBar from "primevue/progressbar";
import ProgressSpinner from "primevue/progressspinner";
import Rating from "primevue/rating";
import RadioButton from "primevue/radiobutton";
import Ripple from "primevue/ripple";
import Row from "primevue/row";
import SelectButton from "primevue/selectbutton";
import ScrollPanel from "primevue/scrollpanel";
import ScrollTop from "primevue/scrolltop";
import Skeleton from "primevue/skeleton";
import Slider from "primevue/slider";
import SpeedDial from "primevue/speeddial";
import SplitButton from "primevue/splitbutton";
import Splitter from "primevue/splitter";
import SplitterPanel from "primevue/splitterpanel";
import Steps from "primevue/steps";
import StyleClass from "primevue/styleclass";
import TabMenu from "primevue/tabmenu";
import TieredMenu from "primevue/tieredmenu";
import Textarea from "primevue/textarea";
import Toast from "primevue/toast";
import ToastService from "primevue/toastservice";
import Tabs from "primevue/tabs";
import TabList from "primevue/tablist";
import Tab from "primevue/tab";
import TabPanels from "primevue/tabpanels";
import TabPanel from "primevue/tabpanel";
import Tag from "primevue/tag";
import ToggleSwitch from "primevue/toggleswitch";
import Terminal from "primevue/terminal";
import Timeline from "primevue/timeline";
import Tooltip from "primevue/tooltip";
import Toolbar from "primevue/toolbar";
import ToggleButton from "primevue/togglebutton";
import Tree from "primevue/tree";
import TreeSelect from "primevue/treeselect";
import TreeTable from "primevue/treetable";
import VirtualScroller from "primevue/virtualscroller";

import CardTitle from "@/components/CardTitle.vue";
import BreadCrumbs from "@/components/BreadCrumbs.vue";
import BaseMultiSelect from "@/components/base/BaseMultiSelect.vue";
import { definePreset } from "@primeuix/themes";
import { QuillEditor } from "@vueup/vue-quill";
import "@vueup/vue-quill/dist/vue-quill.snow.css";
import "@vueup/vue-quill/dist/vue-quill.bubble.css";
const Noir = definePreset(Aura, {
  semantic: {
    primary: {
      50: "#A796C8",
      100: "#9581BD",
      200: "#836CB2",
      300: "#7257A6",
      400: "#634C91",
      500: "#55417C",
      600: "#4C3B70",
      700: "#443463",
      800: "#3B2E57",
      950: "#241C38",
    },
    colorScheme: {
      light: {
        semantic: {
          text: {
            color: "#000000",
            mutedColor: "#8899a8",
          },
        },
        primary: {
          color: "{primary.500}",
          contrastColor: "#ffffff",
          hoverColor: "{primary.600}",
          activeColor: "{primary.700}",
        },
        highlight: {
          background: "{primary.50}",
          focusBackground: "{primary.100}",
          color: "{primary.700}",
          focusColor: "{primary.800}",
        },
      },
      dark: {
        primary: {
          color: "{primary.400}",
          contrastColor: "{surface.900}",
          hoverColor: "{primary.300}",
          activeColor: "{primary.200}",
        },
        highlight: {
          background: "color-mix(in srgb, {primary.400}, transparent 84%)",
          focusBackground: "color-mix(in srgb, {primary.400}, transparent 76%)",
          color: "rgba(255,255,255,.87)",
          focusColor: "rgba(255,255,255,.87)",
        },
      },
    },
  },
});

function primeVueLocaleFromStorage(): PrimeVueLocaleOptions {
  const code = localStorage.getItem("locale") || "nl";
  if (code === "en") {
    return (enLocaleFile as { en: PrimeVueLocaleOptions }).en;
  }
  return (nlLocaleFile as { nl: PrimeVueLocaleOptions }).nl;
}

const GlobalComponents = {
  install(app: App): void {
    app.use(PrimeVue, {
      theme: {
        preset: Noir,
        options: {
          darkModeSelector: ".app-dark",
        },
      },
      locale: primeVueLocaleFromStorage(),
    });
    app.use(ToastService);
    app.use(DialogService);
    app.use(ConfirmationService);

    app.directive("tooltip", Tooltip);
    app.directive("badge", BadgeDirective);
    app.directive("ripple", Ripple);
    app.directive("styleclass", StyleClass);

    app.component("CardTitle", CardTitle);
    app.component("BreadCrumbs", BreadCrumbs);
    app.component("BaseMultiSelect", BaseMultiSelect);

    app.component("Accordion", Accordion);
    app.component("AutoComplete", AutoComplete);
    app.component("Avatar", Avatar);
    app.component("AvatarGroup", AvatarGroup);
    app.component("Badge", Badge);
    app.component("BlockUI", BlockUI);
    app.component("Breadcrumb", Breadcrumb);
    app.component("Button", Button);
    app.component("DatePicker", DatePicker);
    app.component("Card", Card);
    app.component("Checkbox", Checkbox);
    app.component("CheckboxGroup", CheckboxGroup);
    app.component("Column", Column);
    app.component("ConfirmDialog", ConfirmDialog);
    app.component("ConfirmPopup", ConfirmPopup);
    app.component("ContextMenu", ContextMenu);
    app.component("Chip", Chip);
    app.component("DataTable", DataTable);
    app.component("DataView", DataView);
    app.component("DeferredContent", DeferredContent);
    app.component("Dialog", Dialog);
    app.component("Divider", Divider);
    app.component("Dock", Dock);
    app.component("Select", Select);
    app.component("DynamicDialog", DynamicDialog);
    app.component("Fieldset", Fieldset);
    app.component("FileUpload", FileUpload);
    app.component("Galleria", Galleria);
    app.component("Image", Image);
    app.component("Inplace", Inplace);
    app.component("Draggable", draggable);
    app.component("InputMask", InputMask);
    app.component("IconField", IconField);
    app.component("InputIcon", InputIcon);
    app.component("InputNumber", InputNumber);
    app.component("InputGroup", InputGroup);
    app.component("InputGroupAddon", InputGroupAddon);
    app.component("InputText", InputText);
    app.component("Knob", Knob);
    app.component("Listbox", Listbox);
    app.component("MegaMenu", MegaMenu);
    app.component("Menu", Menu);
    app.component("Menubar", Menubar);
    app.component("Message", Message);
    app.component("MultiSelect", MultiSelect);
    app.component("OrderList", OrderList);
    app.component("OrganizationChart", OrganizationChart);
    app.component("Paginator", Paginator);
    app.component("Panel", Panel);
    app.component("PanelMenu", PanelMenu);
    app.component("Password", Password);
    app.component("PickList", PickList);
    app.component("Popover", Popover);
    app.component("ProgressBar", ProgressBar);
    app.component("ProgressSpinner", ProgressSpinner);
    app.component("QuillEditor", QuillEditor);
    app.component("RadioButton", RadioButton);
    app.component("Rating", Rating);
    app.component("Row", Row);
    app.component("SelectButton", SelectButton);
    app.component("ScrollPanel", ScrollPanel);
    app.component("ScrollTop", ScrollTop);
    app.component("Slider", Slider);
    app.component("Skeleton", Skeleton);
    app.component("SpeedDial", SpeedDial);
    app.component("SplitButton", SplitButton);
    app.component("Splitter", Splitter);
    app.component("SplitterPanel", SplitterPanel);
    app.component("Steps", Steps);
    app.component("TabMenu", TabMenu);
    app.component("Tabs", Tabs);
    app.component("TabList", TabList);
    app.component("Tab", Tab);
    app.component("TabPanels", TabPanels);
    app.component("TabPanel", TabPanel);
    app.component("Tag", Tag);
    app.component("ToggleSwitch", ToggleSwitch);
    app.component("Textarea", Textarea);
    app.component("Terminal", Terminal);
    app.component("TieredMenu", TieredMenu);
    app.component("Timeline", Timeline);
    app.component("Toast", Toast);
    app.component("Toolbar", Toolbar);
    app.component("ToggleButton", ToggleButton);
    app.component("Tree", Tree);
    app.component("TreeSelect", TreeSelect);
    app.component("TreeTable", TreeTable);
    app.component("VirtualScroller", VirtualScroller);
  },
};

export default GlobalComponents;
