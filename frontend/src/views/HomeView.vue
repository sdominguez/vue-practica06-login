<template>
  <div>
  <v-app-bar
      app
      color="primary"
      dark
    >
    <v-app-bar-nav-icon @click="drawer = !drawer"></v-app-bar-nav-icon>
      <div class="d-flex align-center">
        <v-img
          alt="UV Logo"
          class="shrink mr-2"
          contain
          src="../images/BN_Logo_de_la_Universidad_Veracruzana.png"
          transition="scale-transition"
          width="40"
        />
      </div>

      <v-spacer></v-spacer>

      <v-btn @click="logout">
        <span class="mr-2">Logout</span>
        <v-icon>mdi-logout</v-icon>
      </v-btn>
  </v-app-bar>

  <v-navigation-drawer
      v-model="drawer"
      absolute
      temporary
    >
      <v-list-item>
        <v-list-item-avatar>
          <v-img src="https://randomuser.me/api/portraits/men/78.jpg"></v-img>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-list-item-title>{{ nombre_usuario }}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

      <v-divider></v-divider>

      <v-list dense>
        <v-list-item v-for="item in items" :key="item.title" link  @click="handleItemClick(item)">
          <v-list-item-icon>
            <v-icon>{{ item.icon }}</v-icon>
          </v-list-item-icon>

          <v-list-item-content>
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>
  
  <hello-world />
 </div>
</template>


<script>
import HelloWorld from '../components/HelloWorld'

export default {
  name: 'HomeView',

  data() {
    return {
      drawer: false,
      nombre_usuario: 'Usuario', 
      items: [
        // elementos de navegación
        { title: 'Home', icon: 'mdi-home' },
        { title: 'Cuenta', icon: 'mdi-account' },
        { title: 'Logout', icon: 'mdi-logout' },
      ],
    };
  },

  components: {
    HelloWorld,
  },
  beforeCreate() {
    if (!sessionStorage.getItem('usuario')) {
      this.$router.push('/');
    }
  },
  mounted(){
    this.nombre_usuario = sessionStorage.getItem('usuario');
    console.log(this.nombre_usuario);
  },
  methods: {
    logout() {
      sessionStorage.removeItem('usuario');
      localStorage.clear();
      sessionStorage.clear();
      this.$router.push('/');
    },
    handleItemClick(item) {
      switch (item.title) {
        case 'Home':
          this.$router.push('/home');
          break;
        case 'Cuenta':
          this.$router.push('/cuenta');
          break;
        case 'Logout':
          this.logout();
          break;
        default:
          break;
      }
    }
  }
}
</script>
