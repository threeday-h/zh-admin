import { createApp } from 'vue'
import { globalRegister } from './global'

import App from './App.vue'
import store from './store'
import router from './router'

// import './utils/rem'
import './assets/css/tailwind.css'
import 'virtual:svg-icons-register'

const app = createApp(App)

app.use(store)
app.use(router)
app.mount('#app')
app.use(globalRegister)
