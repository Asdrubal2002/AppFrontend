import React from 'react';
import Onboarding from 'react-native-onboarding-swiper';
import { Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const StoreOnboardingCreatedStore = ({ onFinish }) => {
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
              source={require('../../../../utils/imgs/setting.png')}
              style={{ width: 300, height: 300 }}
              resizeMode="contain"
            />
          ),
          title: 'Empiezas desde "0"',
          subtitle:
            'Para que tu negocio funcione perfectamente, necesitamos organizarlo bien. Comencemos con la configuración básica.',
          titleStyles: { marginTop: 20, color: 'white' },
          subTitleStyles: { marginTop: 10, paddingHorizontal: 30, color: '#d1d5db', textAlign: 'center' }
        },

        {
          backgroundColor: '#121212',
          image: (
            <Image source={require('../../../../utils/imgs/creative.png')} style={{ width: 300, height: 300 }} />
          ),
          title: 'Presentación',
          subtitle:
            'Para atraer clientes, tu negocio necesita presentación profesional: logo, banner atractivo, categorías claras y contenido relevante.', titleStyles: { marginTop: 20, color: 'white' },
          subTitleStyles: { marginTop: 10, paddingHorizontal: 30, color: '#d1d5db', textAlign: 'center' }
        },

        {
          backgroundColor: '#040404',
          image: (
            <Image source={require('../../../../utils/imgs/shipping.png')} style={{ width: 300, height: 300 }} />
          ),
          title: 'Métodos',
          subtitle:
            'Configura también tus métodos de pago aceptados y define las zonas y métodos de envío o entrega para tus clientes.',
          titleStyles: { marginTop: 20, color: 'white' },
          subTitleStyles: { marginTop: 10, paddingHorizontal: 30, color: '#d1d5db', textAlign: 'center' }
        },

        {
          backgroundColor: '#121212',
          image: (
            <Image source={require('../../../../utils/imgs/product.png')} style={{ width: 300, height: 300 }} />
          ),
          title: 'Tus ventas',
          subtitle:
           'Clasifica todos tus productos en categorías específicas y describe cada uno con detalle para aumentar tus ventas y fidelizar clientes.',
          titleStyles: { marginTop: 20, color: 'white' },
          subTitleStyles: { marginTop: 10, paddingHorizontal: 30, color: '#d1d5db', textAlign: 'center' }
        },

        {
          backgroundColor: '#040404',
          image: (
            <Image source={require('../../../../utils/imgs/final.png')} style={{ width: 300, height: 300 }} />
          ),
          title: 'Empieza a crear tu meta.',
          subtitle:
            'Con Ruvlo tienes las herramientas para organizar, atraer clientes y hacer crecer tu negocio paso a paso.',
          titleStyles: { marginTop: 20, color: 'white' },
          subTitleStyles: { marginTop: 10, paddingHorizontal: 30, color: '#d1d5db', textAlign: 'center' }
        },
      ]}
    />
  );
};

export default StoreOnboardingCreatedStore;
