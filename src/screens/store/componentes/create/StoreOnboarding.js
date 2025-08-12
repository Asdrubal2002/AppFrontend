import React from 'react';
import Onboarding from 'react-native-onboarding-swiper';
import { Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const StoreOnboarding = ({ onFinish }) => {
    return (
        <Onboarding
            onDone={onFinish}
            onSkip={onFinish}
            nextLabel="Siguiente"
            skipLabel="Saltar"
            doneLabel="Listo"
            pages={[
                {
                    backgroundColor: '#040404',
                    image: (
                        <Image
                            source={require('../../../../utils/imgs/ruvlo.png')}
                            style={{ width: 200, height: 200 }}
                            resizeMode="contain"
                        />
                    ),
                    title: 'Bienvenido/a a Ruvlo',
                    subtitle: 
                          'Aquí aprenderás a gestionar tu negocio de forma simple, organizada y profesional.',
                    titleStyles: { marginTop: 20, color: 'white' },
                    subTitleStyles: { marginTop: 10, paddingHorizontal: 30, color: '#d1d5db', textAlign: 'center' }
                },

                {
                    backgroundColor: '#121212',
                    image: (
                        <Image source={require('../../../../utils/imgs/1.png')} style={{ width: 300, height: 300 }} />
                    ),
                    title:'Tu negocio, siempre al día',
                    subtitle: 
                          'Podrás actualizar la información de tu negocio en cualquier momento. Mantén todo bajo control.',
                    titleStyles: { marginTop: 20, color: 'white' },
                    subTitleStyles: { marginTop: 10, paddingHorizontal: 30, color: '#d1d5db', textAlign: 'center' }
                },
                {
                    backgroundColor: '#121212',
                    image: (
                        <Image source={require('../../../../utils/imgs/3.png')} style={{ width: 300, height: 300 }} />
                    ),
                    title: 'Organiza tu catálogo',
                    subtitle: 
                          'Crea y administra categorías para que tus clientes encuentren fácilmente lo que ofreces.',
                    titleStyles: { marginTop: 20, color: 'white' },
                    subTitleStyles: { marginTop: 10, paddingHorizontal: 30, color: '#d1d5db', textAlign: 'center' }
                },
                {
                    backgroundColor: '#040404',
                    image: (
                        <Image source={require('../../../../utils/imgs/4.png')} style={{ width: 300, height: 300 }} />
                    ),
                    title:'Publica con propósito',
                    subtitle:
                          'Comparte promociones, historias o novedades para atraer a más personas a tu negocio.',
                    titleStyles: { marginTop: 20, color: 'white' },
                    subTitleStyles: { marginTop: 10, paddingHorizontal: 30, color: '#d1d5db', textAlign: 'center' }
                },
                {
                    backgroundColor: '#040404',
                    image: (
                        <Image source={require('../../../../utils/imgs/final.png')} style={{ width: 300, height: 300 }} />
                    ),
                    title: 'El camino comienza aquí',
                    subtitle: 
                          'Ruvlo es tu espacio para crecer, conectar y hacer que tu negocio llegue más lejos.',
                    titleStyles: { marginTop: 20, color: 'white' },
                    subTitleStyles: { marginTop: 10, paddingHorizontal: 30, color: '#d1d5db', textAlign: 'center' }
                },
            ]}
        />
    );
};

export default StoreOnboarding;
