import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';
import ScheduleTimePicker from '../ScheduleTimePicker';
import { daysOfWeek } from '../../../../../utils/constants';
import { Alert } from 'react-native';
import { COLORS } from '../../../../../../theme';

interface Props {
  scheduleInputs: {
    open_time?: string;
    close_time?: string;
    day?: number;
    day_display?: string;
  }[];
  setScheduleInputs: React.Dispatch<React.SetStateAction<any[]>>;
}

const ScheduleStep = ({ scheduleInputs, setScheduleInputs }: Props) => {
  const handleClearDay = (index: number) => {
    setScheduleInputs(prev =>
      prev.map((item, i) =>
        i === index
          ? {
            ...item,
            open_time: '',
            close_time: '',
          }
          : item
      )
    );
  };

  const handleScheduleChange = (index: number, field: 'open_time' | 'close_time', value: string) => {
    setScheduleInputs(prev =>
      prev.map((item, i) => {
        if (i === index) {
          const dayInfo = daysOfWeek[i];
          return {
            ...item,
            [field]: value,
            day: dayInfo.day,
            day_display: dayInfo.day_display,
          };
        }
        return item;
      })
    );
  };

  const handleCopyMondaySchedule = () => {
    const monday = scheduleInputs[0]; // Lunes está en el índice 0
    if (!monday?.open_time || !monday?.close_time) return;

    const updated = scheduleInputs.map((item, index) => {
      // Índices 1 a 4 corresponden a Martes a Viernes
      if (index >= 1 && index <= 4) {
        const dayInfo = daysOfWeek[index];
        return {
          ...item,
          open_time: monday.open_time,
          close_time: monday.close_time,
          day: dayInfo.day,
          day_display: dayInfo.day_display,
        };
      }
      return item;
    });

    setScheduleInputs(updated);

    Alert.alert(
      'Horarios copiados',
      'El horario del lunes se copió a martes, miércoles, jueves y viernes. Recuerda revisar sábado y domingo si los necesitas.',
      [
        {
          text: 'Entendido', // <- texto personalizado
          onPress: () => console.log('Usuario cerró el mensaje'),
        },
      ]
    );

  };

  const isMondayComplete = () => {
    const monday = scheduleInputs[0];
    return !!monday?.open_time && !!monday?.close_time;
  };

  return (
    <View style={tw`p-4 rounded-2xl shadow-lg`}>
      <Text style={tw`text-white text-2xl font-bold`}>Horarios de servicio</Text>

      <View style={tw`p-2 m-2`}>
        <Text style={tw`text-gray-300 text-sm mb-4`}>
          Indica en qué horarios podrás responder mensajes o estar disponible para tus clientes.
        </Text>
      </View>

      



      {daysOfWeek.map(({ day_display, short }, idx) => (
        <View key={day_display} style={tw`mb-4 bg-gray-800 p-4 rounded-2xl shadow-md`}>
          <View style={tw`flex-row justify-between items-center mb-3 border-b border-gray-600 pb-1`}>
            <Text style={tw`text-white text-base font-semibold`}>{short}</Text>
            <TouchableOpacity onPress={() => handleClearDay(idx)}>
              <Text style={tw`text-blue-400 text-xs`}>Limpiar este horario</Text>
            </TouchableOpacity>
          </View>

          <View style={tw`flex-row justify-between gap-4`}>
            <View style={tw`flex-1`}>
              <Text style={tw`text-gray-400 text-xs mb-1`}>Abre</Text>
              <ScheduleTimePicker
                value={scheduleInputs[idx]?.open_time || ''}
                onChange={(val) => handleScheduleChange(idx, 'open_time', val)}
              />
            </View>
            <View style={tw`flex-1`}>
              <Text style={tw`text-gray-400 text-xs mb-1`}>Cierra</Text>
              <ScheduleTimePicker
                value={scheduleInputs[idx]?.close_time || ''}
                onChange={(val) => handleScheduleChange(idx, 'close_time', val)}
              />
            </View>
          </View>

          {/* Solo mostrar el botón después del lunes */}
          {idx === 0 && (
            <TouchableOpacity
              onPress={handleCopyMondaySchedule}
              disabled={!isMondayComplete()}
              style={[
                tw`p-3 rounded-xl mt-4`,
                {
                  backgroundColor: isMondayComplete() ? COLORS.BlueWord : '#e0062aff',
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.25,
                  shadowRadius: 3.84,
                  elevation: 5,
                },
              ]}
            >
              <View>
                <Text style={tw`text-white text-center font-semibold text-base`}>
                  {isMondayComplete()
                    ? 'Copiar horario del lunes'
                    : 'Copiar este horario hasta el viernes'}
                </Text>

                <Text style={tw`text-gray-100 text-center text-xs mt-1`}>
                  {isMondayComplete()
                    ? 'Toca aquí para aplicar el mismo horario a los días martes a viernes.'
                    : 'Debes establecer primero un horario válido el lunes para copiarlo al resto de la semana.'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
      ))}

    </View>
  );
};

export default ScheduleStep;
