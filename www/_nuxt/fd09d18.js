(window.webpackJsonp=window.webpackJsonp||[]).push([[9,14],{322:function(e,t,n){"use strict";n.r(t);n(234),n(31);var r=n(7).default.extend({props:{delay:{type:Number,default:150}},data:function(){return{isVisible:!1,timeout:0}},methods:{show:function(){var e=this;this.timeout||(this.timeout=setTimeout((function(){e.isVisible=!0}),this.delay))},hide:function(){clearTimeout(this.timeout),this.isVisible=!1,this.timeout=0}}}),o=n(63),component=Object(o.a)(r,(function(){var e=this,t=e.$createElement,n=e._self._c||t;return e.isVisible?n("b-spinner",{attrs:{small:"",label:"Spinning"}}):e._e()}),[],!1,null,null,null);t.default=component.exports},329:function(e,t,n){"use strict";n.r(t);var r,o=n(16),l=(n(64),n(7)),m=n(322);!function(e){e[e.input=0]="input",e[e.request=1]="request",e[e.registered=2]="registered"}(r||(r={}));var c=l.default.extend({props:{bus:l.default},components:{Spinner:m.default},data:function(){return{username:"",formState:r.input}},computed:{usernameState:function(){return this.username.length>=4},usernameInvalidFeedback:function(){return this.username.length>0?"Enter at least 4 characters.":"Please enter something."}},methods:{clear:function(){this.$refs.spinner.hide(),this.username="",this.formState=r.input},formIsDisabled:function(){return this.formState!=r.input},submit:function(e){e.preventDefault(),this.register()},mounted:function(){this.$refs.spinner.show()},register:function(){var e=this,t=this.$refs.spinner;this.formState=r.request,t.show(),this.$axios.$post("users/register",{username:this.username}).then(function(){var n=Object(o.a)(regeneratorRuntime.mark((function n(o){return regeneratorRuntime.wrap((function(n){for(;;)switch(n.prev=n.next){case 0:e.formState=r.registered,e.bus.$emit("user",e.username),e.bus.$emit("showSuccess","Registrácia bola úspešná."),t.hide();case 4:case"end":return n.stop()}}),n)})));return function(e){return n.apply(this,arguments)}}()).catch((function(n){e.formState=r.input,e.bus.$emit("showError","Nie je možné registrovať, skúste prosím neskôr."),t.hide()}))}}}),f=n(63),component=Object(f.a)(c,(function(){var e=this,t=e.$createElement,n=e._self._c||t;return n("b-card",[n("b-jumbotron",{attrs:{header:"Registrácia užívateľa",lead:"Zvolťe si ľubovoľné užívateľské meno.","bg-variant":"white"}},[n("form",{on:{submit:e.submit}},[n("b-form-group",{attrs:{id:"username-fieldset",description:"Zadajte vaše užívateľské meno.",label:"Meno užívateľa","label-for":"username","valid-feedback":"Thank you!",disabled:e.formIsDisabled()}},[n("b-form-input",{attrs:{id:"username",placeholder:"Užívateľské meno",trim:"",required:"",disabled:e.formIsDisabled()},model:{value:e.username,callback:function(t){e.username=t},expression:"username"}})],1),e._v(" "),n("div",{staticClass:"form-group"},[n("b-button",{attrs:{size:"lg",type:"submit",variant:"primary",disabled:e.formIsDisabled()}},[e._v("\n          Registruj\n          "),n("spinner",{ref:"spinner"})],1)],1)],1)])],1)}),[],!1,null,null,null);t.default=component.exports;installComponents(component,{Spinner:n(322).default})}}]);