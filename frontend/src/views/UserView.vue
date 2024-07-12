<template>
    <v-container fill-height>
        <v-row align="center" justify="center">
        <v-col cols="8" md="4">
            <h2>Registro de Usuario</h2>
                <v-form ref="form" v-model="isFormValid" lazy-validation>
                    <v-text-field v-model="name" :rules="nameRules" label="Nombre" required></v-text-field>
                    <v-text-field v-model="user" :rules="userRules" label="Nombre de usuario" required></v-text-field>
                    <v-text-field v-model="email" :rules="emailRules" label="Correo" required></v-text-field>
                    <v-text-field v-model="address" :rules="addressRules" label="Dirección" required></v-text-field>
                    <v-text-field v-model="phone" :rules="phoneRules" label="Teléfono" required></v-text-field>
                    <v-text-field v-model="contrasenia" :rules="passwordRules" label="Contraseña" type="Password"
                        required></v-text-field>

                    <v-btn color="green" @click="submitForm">
                        Registrar
                    </v-btn>
                    <v-btn class="ml-4" color="blue" @click="resetForm">
                        Limpiar
                    </v-btn>
                </v-form>
            </v-col>
        </v-row>
    </v-container>
</template>

<script>
import axios from 'axios';
import Cookies from 'js-cookie';

export default {
    name: 'ResultView',
    props: {
        nombre: {
            type: String,
            required: true
        },
        correo: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        telefono: {
            type: String,
            required: true
        },
        usuario: {
            type: String,
            required: true
        },
        direccion: {
            type: String,
            required: true
        },

    },
    data() {
        return {
            isFormValid: false,
            name: this.nombre,
            user: this.usuario,
            email: this.correo,
            address: this.direccion,
            phone: this.telefono,
            contrasenia: this.password,
            nameRules: [
                v => !!v || 'Nombre es requerido',
            ],
            userRules: [
                v => !!v || 'Nombre de usuario es requerido',
            ],
            emailRules: [
                v => !!v || 'Correo es requerido',
                v => /.+@.+\..+/.test(v) || 'El correo debe ser valido',
            ],
            addressRules: [
                v => !!v || 'Dirección es requerida',
            ],
            phoneRules: [
                v => !!v || 'Teléfono es requerido',
                v => (/^\d+$/.test(v) && v.length === 10) || 'El teléfono debe contener solo dígitos y tener 10 caracteres',
            ],
            passwordRules: [
                v => !!v || 'Contraseña es requerido',
                v => (v && v.length >= 6) || 'La contraseña no debe ser menor a 6 caracteres',
            ],
        };
    },
    methods: {
        submitForm() {
            if (this.$refs.form.validate()) {
                axios.post('http://localhost:3000/nuevousuario', {
                    usuario: this.user,
                    correo: this.email,
                    password: this.contrasenia,
                    direccion: this.address,
                    nombre: this.name,
                    telefono: this.phone
                }).then(() => {
                    this.$swal({
                        icon: "success",
                        title: "Información enviada correctamente",
                        showConfirmButton: false,
                        timer: 1500
                    });
                }).then(() => {
                    Cookies.set('ccorreo', this.email, { expires: 7, path: '/' });
                    this.$router.push({ name: 'login' });
                }).catch(error => {
                    this.$swal({
                        icon: "error",
                        title: "Oops...",
                        text: "Ocurrió un error al enviar la información",
                    });
                    console.error(error);
                });
            }else{
                this.$swal({
                    icon: "error",
                    title: "Oops...",
                    text: "Revisa los campos del formulario",
                })
            }
        },
        resetForm() {
            this.$refs.form.reset();
            this.name = '';
            this.email = '';
            // eslint-disable-next-line vue/no-mutating-props
            this.contrasenia = '';
        },
    },
}
</script>