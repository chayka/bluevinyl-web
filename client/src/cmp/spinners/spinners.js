Vue.component('spinner', {
    props: ['mode', 'message', 'visible'],
    template: ` <div class="surge-spinner"
                    :style="{display: mode === 'display' && !visible ? 'none' : '', visibility: mode === 'visibility' && !visible ? 'hidden' : ''}">
                    <span class="spinner-message" v-if="!message"><slot></slot></span>
                    <span class="spinner-message" v-if="!!message">{{message}}</span>
                </div>`,
    data(){
        return {
            'mode': 'display',
            'message': '',
            'visible': false,
        };
    },
    methods: {

        /**
         * Show spinner with a message
         * @param message
         */
        show(message = ''){
            this.message = message;
            this.visible = true;
        },

        /**
         * Hide spinner
         */
        hide(){
            this.visible = false;
        }
    }
});

Vue.component('spinners', {
    template: ` <div class="surge-spinners" v-if="spinners.length">
                    <div class="spinners">
                        <spinner v-for="spinner of spinners" :message="spinner.message" :visible="true"></spinner>
                    </div>
                </div>`,
    data(){
        return {
            spinners: [],
            counter: 0,
        }
    },

    methods: {
        /**
         * Adds message to a queue, returns spinner id.
         * When queue is non empty, the top item is shown.
         * On mouse over, whole stack is shown.
         *
         * @param {string} message
         * @param {string} id
         * @return {string}
         */
        show(message = 'Loading...', id = '') {
            let spinner = {
                id: id || `spinners_${++this.counter}`,
                message
            };
            this.spinners.push(spinner);
            this.$forceUpdate();
            return spinner.id;
        },

        /**
         * Removes message from stack.
         * When stack is empty, general spinner is hidden
         * @param id
         */
        hide(id) {
            let index = this.spinners.findIndex(value => id === value.id);
            if(index >= 0){
                this.spinners.splice(index, 1);
            }
            this.$forceUpdate();
        }

    },

    created(){
        Vue.$spinners = Vue.$spinners || this;
    }
});