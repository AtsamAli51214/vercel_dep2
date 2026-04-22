import{P,o,c as y,Q as m,h as C,R as v,S as _,T as E,Y as G,U as M,V as Q,i as X,v as k,w as f,W as A,X as B,e as i,Z as I,$ as Y,F as z,d as Z,u as q,a as H,a0 as J,g,t as w,f as u,r as V,M as K}from"./index-B-UUf32G.js";import{B as ee}from"./back-arrow-CsE7NrcR.js";import{c as te}from"./LibraryService-Y59m0VBv.js";import{_ as ae,a as ne,b as re,c as se}from"./clubMappers-B1IylJTw.js";import"./common-BrPbYpmj.js";import"./federationService-fRB6CJP1.js";import"./supplierService-DY1d2FL4.js";import"./vee-validate-zod-qGeOOx4E.js";import"./formOptions-DGhUCsQ9.js";import"./CountrySelect-CWID2RP7.js";import"./be-icon-CKAzGFTw.js";import"./ClubContactForm.vue_vue_type_script_setup_true_lang-C6tjY1oh.js";import"./BasePhoneInput.vue_vue_type_script_setup_true_lang-CBR_v_zX.js";import"./minus-icon-D_AW_IPj.js";import"./ContractDocForm.vue_vue_type_script_setup_true_lang-Barq8UUf.js";import"./BaseFileUpload.vue_vue_type_script_setup_true_lang-Drd8hjT0.js";import"./misc-icon-DrNxfJD_.js";import"./usePrimeVueDatePickerSync-C3J_c5Y5.js";var pe=`
    .p-steplist {
        position: relative;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 0;
        padding: 0;
        list-style-type: none;
        overflow-x: auto;
    }

    .p-step {
        position: relative;
        display: flex;
        flex: 1 1 auto;
        align-items: center;
        gap: dt('stepper.step.gap');
        padding: dt('stepper.step.padding');
    }

    .p-step:last-of-type {
        flex: initial;
    }

    .p-step-header {
        border: 0 none;
        display: inline-flex;
        align-items: center;
        text-decoration: none;
        cursor: pointer;
        transition:
            background dt('stepper.transition.duration'),
            color dt('stepper.transition.duration'),
            border-color dt('stepper.transition.duration'),
            outline-color dt('stepper.transition.duration'),
            box-shadow dt('stepper.transition.duration');
        border-radius: dt('stepper.step.header.border.radius');
        outline-color: transparent;
        background: transparent;
        padding: dt('stepper.step.header.padding');
        gap: dt('stepper.step.header.gap');
    }

    .p-step-header:focus-visible {
        box-shadow: dt('stepper.step.header.focus.ring.shadow');
        outline: dt('stepper.step.header.focus.ring.width') dt('stepper.step.header.focus.ring.style') dt('stepper.step.header.focus.ring.color');
        outline-offset: dt('stepper.step.header.focus.ring.offset');
    }

    .p-stepper.p-stepper-readonly .p-step {
        cursor: auto;
    }

    .p-step-title {
        display: block;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
        color: dt('stepper.step.title.color');
        font-weight: dt('stepper.step.title.font.weight');
        transition:
            background dt('stepper.transition.duration'),
            color dt('stepper.transition.duration'),
            border-color dt('stepper.transition.duration'),
            box-shadow dt('stepper.transition.duration'),
            outline-color dt('stepper.transition.duration');
    }

    .p-step-number {
        display: flex;
        align-items: center;
        justify-content: center;
        color: dt('stepper.step.number.color');
        border: 2px solid dt('stepper.step.number.border.color');
        background: dt('stepper.step.number.background');
        min-width: dt('stepper.step.number.size');
        height: dt('stepper.step.number.size');
        line-height: dt('stepper.step.number.size');
        font-size: dt('stepper.step.number.font.size');
        z-index: 1;
        border-radius: dt('stepper.step.number.border.radius');
        position: relative;
        font-weight: dt('stepper.step.number.font.weight');
    }

    .p-step-number::after {
        content: ' ';
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: dt('stepper.step.number.border.radius');
        box-shadow: dt('stepper.step.number.shadow');
    }

    .p-step-active .p-step-header {
        cursor: default;
    }

    .p-step-active .p-step-number {
        background: dt('stepper.step.number.active.background');
        border-color: dt('stepper.step.number.active.border.color');
        color: dt('stepper.step.number.active.color');
    }

    .p-step-active .p-step-title {
        color: dt('stepper.step.title.active.color');
    }

    .p-step:not(.p-disabled):focus-visible {
        outline: dt('focus.ring.width') dt('focus.ring.style') dt('focus.ring.color');
        outline-offset: dt('focus.ring.offset');
    }

    .p-step:has(~ .p-step-active) .p-stepper-separator {
        background: dt('stepper.separator.active.background');
    }

    .p-stepper-separator {
        flex: 1 1 0;
        background: dt('stepper.separator.background');
        width: 100%;
        height: dt('stepper.separator.size');
        transition:
            background dt('stepper.transition.duration'),
            color dt('stepper.transition.duration'),
            border-color dt('stepper.transition.duration'),
            box-shadow dt('stepper.transition.duration'),
            outline-color dt('stepper.transition.duration');
    }

    .p-steppanels {
        padding: dt('stepper.steppanels.padding');
    }

    .p-steppanel {
        background: dt('stepper.steppanel.background');
        color: dt('stepper.steppanel.color');
    }

    .p-stepper:has(.p-stepitem) {
        display: flex;
        flex-direction: column;
    }

    .p-stepitem {
        display: flex;
        flex-direction: column;
        flex: initial;
    }

    .p-stepitem.p-stepitem-active {
        flex: 1 1 auto;
    }

    .p-stepitem .p-step {
        flex: initial;
    }
    
    .p-stepitem .p-steppanel {
        display: grid;
        grid-template-rows: 1fr;
    }

    .p-stepitem .p-steppanel-content-wrapper {
        display: flex;
        flex: 1 1 auto;
        min-height: 0;
    }
    .p-stepitem .p-steppanel-content {
        width: 100%;
        padding: dt('stepper.steppanel.padding');
        margin-inline-start: 1rem;
    }

    .p-stepitem .p-stepper-separator {
        flex: 0 0 auto;
        width: dt('stepper.separator.size');
        height: auto;
        margin: dt('stepper.separator.margin');
        position: relative;
        left: calc(-1 * dt('stepper.separator.size'));
    }

    .p-stepitem .p-stepper-separator:dir(rtl) {
        left: calc(-9 * dt('stepper.separator.size'));
    }

    .p-stepitem:has(~ .p-stepitem-active) .p-stepper-separator {
        background: dt('stepper.separator.active.background');
    }

    .p-stepitem:last-of-type .p-steppanel {
        padding-inline-start: dt('stepper.step.number.size');
    }
`,ie={root:function(t){var n=t.props;return["p-stepper p-component",{"p-readonly":n.linear}]},separator:"p-stepper-separator"},oe=P.extend({name:"stepper",style:pe,classes:ie}),le={name:"BaseStepper",extends:_,props:{value:{type:[String,Number],default:void 0},linear:{type:Boolean,default:!1}},style:oe,provide:function(){return{$pcStepper:this,$parentInstance:this}}},N={name:"Stepper",extends:le,inheritAttrs:!1,emits:["update:value"],data:function(){return{d_value:this.value}},watch:{value:function(t){this.d_value=t}},methods:{updateValue:function(t){this.d_value!==t&&(this.d_value=t,this.$emit("update:value",t))},isStepActive:function(t){return this.d_value===t},isStepDisabled:function(){return this.linear}}};function de(e,t,n,s,c,a){return o(),y("div",v({class:e.cx("root"),role:"tablist"},e.ptmi("root")),[e.$slots.start?m(e.$slots,"start",{key:0}):C("",!0),m(e.$slots,"default"),e.$slots.end?m(e.$slots,"end",{key:1}):C("",!0)],16)}N.render=de;var ce={root:"p-steppanels"},ue=P.extend({name:"steppanels",classes:ce}),ve={name:"BaseStepPanels",extends:_,style:ue,provide:function(){return{$pcStepPanels:this,$parentInstance:this}}},T={name:"StepPanels",extends:ve,inheritAttrs:!1};function fe(e,t,n,s,c,a){return o(),y("div",v({class:e.cx("root")},e.ptmi("root")),[m(e.$slots,"default")],16)}T.render=fe;var me={root:function(t){var n=t.instance;return["p-steppanel",{"p-steppanel-active":n.isVertical&&n.active}]},contentWrapper:"p-steppanel-content-wrapper",content:"p-steppanel-content"},he=P.extend({name:"steppanel",classes:me}),j={name:"StepperSeparator",hostName:"Stepper",extends:_,inject:{$pcStepper:{default:null}}};function be(e,t,n,s,c,a){return o(),y("span",v({class:e.cx("separator")},e.ptmo(a.$pcStepper.pt,"separator")),null,16)}j.render=be;var ge={name:"BaseStepPanel",extends:_,props:{value:{type:[String,Number],default:void 0},asChild:{type:Boolean,default:!1},as:{type:[String,Object],default:"DIV"}},style:he,provide:function(){return{$pcStepPanel:this,$parentInstance:this}}},O={name:"StepPanel",extends:ge,inheritAttrs:!1,inject:{$pcStepper:{default:null},$pcStepItem:{default:null},$pcStepList:{default:null}},data:function(){return{isSeparatorVisible:!1}},mounted:function(){if(this.$el){var t,n,s=G(this.$pcStepper.$el,'[data-pc-name="step"]'),c=M(this.isVertical?(t=this.$pcStepItem)===null||t===void 0?void 0:t.$el:(n=this.$pcStepList)===null||n===void 0?void 0:n.$el,'[data-pc-name="step"]'),a=Q(c,s);this.isSeparatorVisible=this.isVertical&&a!==s.length-1}},methods:{getPTOptions:function(t){var n=t==="root"?this.ptmi:this.ptm;return n(t,{context:{active:this.active}})},updateValue:function(t){this.$pcStepper.updateValue(t)}},computed:{active:function(){var t,n,s=this.$pcStepItem?(t=this.$pcStepItem)===null||t===void 0?void 0:t.value:this.value;return s===((n=this.$pcStepper)===null||n===void 0?void 0:n.d_value)},isVertical:function(){return!!this.$pcStepItem},activeValue:function(){var t;return this.isVertical?(t=this.$pcStepItem)===null||t===void 0?void 0:t.value:this.value},id:function(){var t;return"".concat((t=this.$pcStepper)===null||t===void 0?void 0:t.$id,"_steppanel_").concat(this.activeValue)},ariaControls:function(){var t;return"".concat((t=this.$pcStepper)===null||t===void 0?void 0:t.$id,"_step_").concat(this.activeValue)},a11yAttrs:function(){return{id:this.id,role:"tabpanel","aria-controls":this.ariaControls,"data-pc-name":"steppanel","data-p-active":this.active}},ptParams:function(){return{context:{active:this.active}}},dataP:function(){return E({vertical:this.$pcStepItem!=null})}},components:{StepperSeparator:j}},ye=["data-p"];function Se(e,t,n,s,c,a){var r=X("StepperSeparator");return a.isVertical?(o(),y(z,{key:0},[e.asChild?m(e.$slots,"default",{key:1,active:a.active,a11yAttrs:a.a11yAttrs,activateCallback:function(l){return a.updateValue(l)}}):(o(),k(Y,v({key:0,name:"p-collapsible"},e.ptm("transition")),{default:f(function(){return[A((o(),k(B(e.as),v({id:a.id,class:e.cx("root"),role:"tabpanel","aria-controls":a.ariaControls,"data-p":a.dataP},a.getPTOptions("root")),{default:f(function(){return[i("div",v({class:e.cx("contentWrapper")},e.ptm("contentWrapper",a.ptParams)),[c.isSeparatorVisible?(o(),k(r,{key:0,"data-p":a.dataP},null,8,["data-p"])):C("",!0),i("div",v({class:e.cx("content"),"data-p":a.dataP},a.getPTOptions("content")),[m(e.$slots,"default",{active:a.active,activateCallback:function(l){return a.updateValue(l)}})],16,ye)],16)]}),_:3},16,["id","class","aria-controls","data-p"])),[[I,a.active]])]}),_:3},16))],64)):(o(),y(z,{key:1},[e.asChild?e.asChild&&a.active?m(e.$slots,"default",{key:1,active:a.active,a11yAttrs:a.a11yAttrs,activateCallback:function(l){return a.updateValue(l)}}):C("",!0):A((o(),k(B(e.as),v({key:0,id:a.id,class:e.cx("root"),role:"tabpanel","aria-controls":a.ariaControls},a.getPTOptions("root")),{default:f(function(){return[m(e.$slots,"default",{active:a.active,activateCallback:function(l){return a.updateValue(l)}})]}),_:3},16,["id","class","aria-controls"])),[[I,a.active]])],64))}O.render=Se;const $e={class:"flex justify-center gap-6"},xe={class:"bg-white rounded-2xl p-6 md:p-15 w-232 relative"},ke=["src"],Ce={class:"flex flex-col gap-6"},_e={class:"flex items-start justify-between md:items-center"},we={class:"flex flex-col"},Ve={class:"font-bold text-3xl text-primary"},Pe={class:"font-medium text-secondary-color text-xs"},De={class:"text-stroke text-4xl font-semibold md:pl-6"},Ze=Z({__name:"AddClub",setup(e){const{t}=q(),n=K(),s=H(),c=J(),a=V(1),r=V({}),h=V(null),l=p=>{r.value.clubDetails=p},U=p=>{r.value.Contacts=p},R=p=>{r.value.Contracts=p},D=async(p,d)=>{var x;(p===1?await((x=h.value)==null?void 0:x.validate()):!0)&&d(p+1)},F=async()=>{s.setLoading(!0,t("loading.creatingClub"));try{const p=se(r.value.clubDetails,r.value.Contacts,r.value.Contracts),d=await te.createClub(p);d.success?n.push({name:"club"}):c.showError(t("validation.unableToDelete.title"),d.error,t("app.ok"))}finally{s.setLoading(!1)}},W=()=>{a.value>1?a.value--:n.back()};return(p,d)=>{const $=O,x=T,L=N;return o(),y("div",$e,[i("div",xe,[i("div",{onClick:W,class:"absolute mt-2 transition-opacity cursor-pointer left-2 md:left-10 hover:opacity-80"},[i("img",{src:g(ee),alt:"back"},null,8,ke)]),i("div",Ce,[i("div",_e,[i("div",we,[i("span",Ve,w(g(t)(`Clubs.createClubTitle${a.value}`)),1),i("span",Pe,w(g(t)(`Clubs.createClubDescription${a.value}`)),1)]),i("span",De,w(a.value)+"/3",1)]),u(L,{value:a.value,"onUpdate:value":d[1]||(d[1]=b=>a.value=b)},{default:f(()=>[u(x,{pt:{root:{class:"!pl-0"}}},{default:f(()=>[u($,{value:1},{default:f(({activateCallback:b})=>[u(g(ae),{ref_key:"clubDetailsRef",ref:h,initialData:r.value.clubDetails,onValidated:d[0]||(d[0]=S=>l(S)),onNext:S=>D(1,b)},null,8,["initialData","onNext"])]),_:1}),u($,{value:2},{default:f(({activateCallback:b})=>{var S;return[u(g(ne),{ref:"contactInfoRef",contacts:r.value.Contacts,"default-country":(S=r.value.clubDetails)==null?void 0:S.Country,activateCallback:b,"onUpdate:contacts":U,onNext:Ae=>D(2,b)},null,8,["contacts","default-country","activateCallback","onNext"])]}),_:1}),u($,{value:3},{default:f(()=>[u(g(re),{documents:r.value.Contracts,"onUpdate:documents":R,onNext:F},null,8,["documents"])]),_:1})]),_:1})]),_:1},8,["value"])])])])}}});export{Ze as default};
