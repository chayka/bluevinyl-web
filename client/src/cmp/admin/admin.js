Vue.component('blue-vinyl-admin', {
    props: [],
    template: [`<div class="blue-vinyl-admin">
                    <div class="controls">
                        <button @click="buttonClicked()">Click</button>
                    </div>
                    <div class="output">{{output}}</div>
                </div>`].join(''),
    data(){
        return {
            output: ''
        };
    },
    created(){
        console.log('Hola, amigos!');
    },
    methods: {
        buttonClicked(){
            this.$http.get('/api/blue-vinyl/noop').then(
                ({body}) => {
                    console.dir({body});
                    this.output = body;
                },
                ({body}) => {
                    console.dir({body});
                }
            );
        }
    }
});