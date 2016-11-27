Vue.component('modal', {
    props: ['visible', 'width', 'height', 'title', 'buttons', 'cls'],
    template: ` <div class="surge-modals-fader" v-if="visible" @click.self="hide('close')">
                    <div :class="['modals-modal'].concat(cls || '').join(' ')" :style="{width: width || '', height: height || ''}">
                        <div class="modal_header">
                            <div class="modal_header-title">{{title}}</div>
                            <div class="modal_header-close" @click="hide('close')">&times;</div>
                        </div>
                        <div class="modal_body"><slot></slot></div>
                        <div class="modal_buttons" v-if="buttons && buttons.length">
                            <button v-for="button of buttons"
                                    @click.prevent="button.persist || hide(button.value!==undefined? button.value : button.text); button.click && button.click();"
                                    :class="['button'].concat(button.cls).join(' ')">{{button.text}}</button>
                        </div>
                    </div>
                </div>`,
    data: () => ({
        visible: false,
        width: '300px',
        height: 'auto',
        title: '',
        buttons: [],
        cls: '',
    }),
    methods: {
        /**
         * Show modal
         */
        show(){
            this.visible = true;
        },

        /**
         * Show modal (alias)
         */
        open(){
            this.show();
        },

        /**
         * Hide modal
         *
         * @param payload
         */
        hide(payload){
            this.visible = false;
            this.$emit('hide', payload || 'unknown');
        },

        /**
         * Hide modal (alias)
         *
         * @param payload
         */
        close(payload){
            this.hide(payload);
        }
    },
    created(){

    }
});

Vue.component('modals', {
    template: ` <div class="modals">
                    <modal ref="modal" v-for="(modal, i) in queue"
                       :title="modal.title"
                       :buttons="modal.buttons"
                       :cls="modal.cls"
                       :width="modal.width"
                       :height="modal.height"
                       :visible="!i" 
                       @hide="close()">
                        {{modal.content}}
                    </modal>
                </div>`,
    data(){
        return {
            queue: []
        }
    },

    computed: {
        modal(){
            return this.queue.length ? this.queue[0] : null;
        }
    },
    methods: {

        /**
         * Add an item to a queue and thus show a modal window.
         *
         * @param {object} modal
         */
        show(modal) {
            let defaults = {
                content: '',
                title: '',
                buttons: [],
                cls: [],
                width: '300px',
                height: 'auto',
            };
            this.queue.push(Object.assign(defaults, modal));
            this.$set(this, 'queue', this.queue);
            this.$forceUpdate();
        },

        /**
         * Alias to show
         *
         * @param modal
         */
        open(modal){
            this.show(modal);
        },

        /**
         * Close current modal popup, by shifting queue
         */
        hide() {
            this.queue.shift();
            this.$set(this, 'queue', this.queue);
            this.$forceUpdate();
        },

        /**
         * Alias to hide
         */
        close() {
            this.hide();
        },

        /**
         * Show alert box - a message with 'Ok' button.
         * Callback is called when Ok is clicked.
         *
         * @param message
         * @param title
         * @param okCallback
         */
        alert(message, title = '', okCallback = null){
            this.show({
                content: message,
                title: title,
                cls: ['alert', 'pre-line'],
                buttons: [{
                    text: 'Ok',
                    click: okCallback
                }]
            });
        },

        /**
         * Show confirm box - a message with 'Yes' & 'No' buttons.
         * Callback is called when 'Yes' is clicked.
         *
         * @param message
         * @param title
         * @param yesCallback
         */
        confirm(message, title = '', yesCallback = null){
            this.show({
                content: message,
                title: title,
                cls: ['confirm', 'pre-line'],
                buttons: [{
                    text: 'No',
                }, {
                    text: 'Yes',
                    click: yesCallback
                }]
            });
        }

    },

    created(){
        Vue.$modals = Vue.$modals || this;
    }
});