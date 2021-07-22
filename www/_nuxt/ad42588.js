(window.webpackJsonp=window.webpackJsonp||[]).push([[11,14],{322:function(e,t,n){"use strict";n.r(t);n(234),n(31);var r=n(7).default.extend({props:{delay:{type:Number,default:150}},data:function(){return{isVisible:!1,timeout:0}},methods:{show:function(){var e=this;this.timeout||(this.timeout=setTimeout((function(){e.isVisible=!0}),this.delay))},hide:function(){clearTimeout(this.timeout),this.isVisible=!1,this.timeout=0}}}),o=n(63),component=Object(o.a)(r,(function(){var e=this,t=e.$createElement,n=e._self._c||t;return e.isVisible?n("b-spinner",{attrs:{small:"",label:"Spinning"}}):e._e()}),[],!1,null,null,null);t.default=component.exports},342:function(e,t,n){"use strict";n.r(t);var r=n(16),o=(n(64),n(31),n(119),n(12),n(4),n(7)),c=n(322);function f(e){return"string"==typeof e?parseFloat(e):e}var l=o.default.extend({components:{Spinner:c.default},props:{bus:o.default},data:function(){return{stats:{loaded:!1,table:[]},config:{loaded:!1,current:{numberOfQueues:0,queueCapacity:0,meanServiceTime:0,serviceTimeDeviation:0},last:{numberOfQueues:0,queueCapacity:0,meanServiceTime:0,serviceTimeDeviation:0},edit:!1,show:!1},interval:null}},computed:{formDisabled:function(){return!this.config.edit}},activated:function(){var e=this;this.loadStats(),this.loadConfig(),this.interval=setInterval((function(){return e.loadStats()}),1e3)},deactivated:function(){clearInterval(this.interval)},beforeDestroy:function(){clearInterval(this.interval)},methods:{loadStats:function(){var e=this;return Object(r.a)(regeneratorRuntime.mark((function t(){var n,r;return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return n={activeUsers:"Aktuálmy počet užívateľov",numberOfQueues:"Aktuálny počet front",queuedRequests:"Počet čakajúcich požiadaviek",completedRequests:"Počet vybavených požiadaviek",rejectedRequests:"Počet zamietnutých požiadaviek",serviceUtilization:"Priemerné využitie stredísk",avgWaitingTime:"Priemerný čas čakania požiadaviek"},t.prev=1,e.$refs.spinnerStats.show(),t.next=5,e.$axios.$get("stats");case 5:(r=t.sent).serviceUtilization=(100*r.serviceUtilization).toFixed(2)+"%",r.avgWaitingTime=r.avgWaitingTime.toFixed(2)+"s",e.stats.table=Object.keys(r).map((function(e){return{Parameter:n[e]||e,Hodnota:r[e]}})),e.$refs.spinnerStats.hide(),e.stats.loaded=!0,t.next=17;break;case 13:t.prev=13,t.t0=t.catch(1),e.$refs.spinnerStats.hide(),e.bus.$emit("showError",t.t0.message);case 17:case"end":return t.stop()}}),t,null,[[1,13]])})))()},clearStats:function(){var e=this;return Object(r.a)(regeneratorRuntime.mark((function t(){return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.prev=0,e.$refs.spinnerStats.show(),t.next=4,e.$axios.$delete("stats");case 4:e.$refs.spinnerStats.hide(),t.next=11;break;case 7:t.prev=7,t.t0=t.catch(0),e.$refs.spinnerStats.hide(),e.bus.$emit("showError",t.t0.message);case 11:case"end":return t.stop()}}),t,null,[[0,7]])})))()},loadConfig:function(){var e=this;return Object(r.a)(regeneratorRuntime.mark((function t(){return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,e.$axios.$get("config");case 2:e.config.current=t.sent,e.config.loaded=!0,e.config.show=!0;case 5:case"end":return t.stop()}}),t)})))()},saveConfig:function(){var e=this;return Object(r.a)(regeneratorRuntime.mark((function t(){return regeneratorRuntime.wrap((function(t){for(;;)switch(t.prev=t.next){case 0:return t.prev=0,e.$refs.spinnerConfig.show(),e.config.current.numberOfQueues=f(e.config.current.numberOfQueues),e.config.current.queueCapacity=f(e.config.current.queueCapacity),e.config.current.meanServiceTime=f(e.config.current.meanServiceTime),e.config.current.serviceTimeDeviation=f(e.config.current.serviceTimeDeviation),t.next=8,e.$axios.$post("config",e.config.current);case 8:e.$refs.spinnerConfig.hide(),e.config.edit=!1,t.next=16;break;case 12:t.prev=12,t.t0=t.catch(0),e.$refs.spinnerConfig.hide(),e.bus.$emit("showError",t.t0.message);case 16:case"end":return t.stop()}}),t,null,[[0,12]])})))()},onEdit:function(){this.config.edit=!0,this.config.last=Object.assign({},this.config.current)},onSubmit:function(e){e.preventDefault(),this.saveConfig()},onCancel:function(e){var t=this;e.preventDefault(),this.config.current=this.config.last,this.config.edit=!1,this.config.show=!1,this.$nextTick((function(){t.config.show=!0}))}}}),m=n(63),component=Object(m.a)(l,(function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("div",[n("h2",[e._v("Server")]),e._v(" "),n("b-row",{attrs:{"align-v":"stretch"}},[n("b-col",{attrs:{md:"6"}},[n("b-card",{staticClass:"h-100",attrs:{header:"Monitorovanie","header-text-variant":"white","header-bg-variant":"dark"}},[e.stats.loaded?n("b-table",{attrs:{striped:"",hover:"",items:e.stats.table}}):e._e(),e._v(" "),n("b-button",{attrs:{variant:"primary"},on:{click:e.clearStats}},[e._v("\n          Vynulovať\n          "),n("spinner",{ref:"spinnerStats"})],1)],1)],1),e._v(" "),n("b-col",{attrs:{md:"6"}},[n("b-card",{staticClass:"h-100",attrs:{header:"Konfigurácia","header-text-variant":"white","header-bg-variant":"dark"}},[e.config.show?n("b-form",{on:{submit:e.onSubmit}},[n("b-form-group",{attrs:{label:"Počet front","label-for":"number-of-queues",description:"Parameter n zo zadania"}},[n("b-form-input",{attrs:{id:"number-of-queues",type:"number",min:"1",max:"1000",disabled:e.formDisabled},model:{value:e.config.current.numberOfQueues,callback:function(t){e.$set(e.config.current,"numberOfQueues",t)},expression:"config.current.numberOfQueues"}})],1),e._v(" "),n("b-form-group",{attrs:{label:"Kapacita fronty","label-for":"queue-capacity",description:"Parameter m zo zadania"}},[n("b-form-input",{attrs:{id:"queue-capacity",type:"number",min:"1",max:"1000",disabled:e.formDisabled},model:{value:e.config.current.queueCapacity,callback:function(t){e.$set(e.config.current,"queueCapacity",t)},expression:"config.current.queueCapacity"}})],1),e._v(" "),n("b-form-group",{attrs:{label:"Doba vybavenia požiadavky","label-for":"mean-service-time",description:"Parameter t zo zadania"}},[n("b-form-input",{attrs:{id:"mean-service-time",type:"number",min:"0",max:"10",step:"0.1",disabled:e.formDisabled},model:{value:e.config.current.meanServiceTime,callback:function(t){e.$set(e.config.current,"meanServiceTime",t)},expression:"config.current.meanServiceTime"}})],1),e._v(" "),n("b-form-group",{attrs:{label:"Náhodnosť doby vybavenia požiadavky","label-for":"service-time-deviation",description:"Parameter r zo zadania"}},[n("b-form-input",{attrs:{id:"service-time-deviation",type:"number",min:"0",max:"10",step:"0.1",disabled:e.formDisabled},model:{value:e.config.current.serviceTimeDeviation,callback:function(t){e.$set(e.config.current,"serviceTimeDeviation",t)},expression:"config.current.serviceTimeDeviation"}})],1),e._v(" "),e.config.edit?e._e():n("b-button",{attrs:{variant:"primary"},on:{click:e.onEdit}},[e._v("Zmeniť")]),e._v(" "),e.config.edit?n("b-button",{attrs:{type:"submit",variant:"primary"}},[e._v("Potvrdiť\n            "),n("spinner",{ref:"spinnerConfig"})],1):e._e(),e._v(" "),e.config.edit?n("b-button",{attrs:{variant:"secondary"},on:{click:e.onCancel}},[e._v("Zrušiť")]):e._e()],1):e._e()],1)],1)],1)],1)}),[],!1,null,null,null);t.default=component.exports;installComponents(component,{Spinner:n(322).default})}}]);