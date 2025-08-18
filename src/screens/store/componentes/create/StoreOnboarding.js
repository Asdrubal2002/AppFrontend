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
            'La plataforma que impulsa tu negocio, conecta con más clientes y hace que tus ventas crezcan.',
          titleStyles: { marginTop: 20, color: 'white' },
          subTitleStyles: { marginTop: 10, paddingHorizontal: 30, color: '#d1d5db', textAlign: 'center' }
        },

        {
          backgroundColor: '#121212',
          image: (
            <Image source={require('../../../../utils/imgs/target.png')} style={{ width: 300, height: 300 }} />
          ),
          title: 'Más visibilidad',
          subtitle: 
            'Tu negocio será más fácil de encontrar. Con Ruvlo, nuevos clientes podrán descubrirte cada día.',
          titleStyles: { marginTop: 20, color: 'white' },
          subTitleStyles: { marginTop: 10, paddingHorizontal: 30, color: '#d1d5db', textAlign: 'center' }
        },

        {
          backgroundColor: '#040404',
          image: (
            <Image source={require('../../../../utils/imgs/todoenlugar.png')} style={{ width: 300, height: 300 }} />
          ),
          title: 'Todo en un solo lugar',
          subtitle: 
            'Gestiona tu catálogo, promociones e inventario desde una única aplicación fácil de usar.',
          titleStyles: { marginTop: 20, color: 'white' },
          subTitleStyles: { marginTop: 10, paddingHorizontal: 30, color: '#d1d5db', textAlign: 'center' }
        },

        {
          backgroundColor: '#121212',
          image: (
            <Image source={require('../../../../utils/imgs/social.png')} style={{ width: 300, height: 300 }} />
          ),
          title: 'Conexión real',
          subtitle:
            'Acerca tu negocio a la comunidad. Comparte novedades y conecta directamente con tus clientes.',
          titleStyles: { marginTop: 20, color: 'white' },
          subTitleStyles: { marginTop: 10, paddingHorizontal: 30, color: '#d1d5db', textAlign: 'center' }
        },

        {
          backgroundColor: '#040404',
          image: (
            <Image source={require('../../../../utils/imgs/final.png')} style={{ width: 300, height: 300 }} />
          ),
          title: 'Tu crecimiento empieza aquí',
          subtitle: 
            'Con Ruvlo tienes las herramientas para organizar, atraer clientes y hacer crecer tu negocio paso a paso.',
          titleStyles: { marginTop: 20, color: 'white' },
          subTitleStyles: { marginTop: 10, paddingHorizontal: 30, color: '#d1d5db', textAlign: 'center' }
        },
      ]}
    />
  );
};

export default StoreOnboarding;
