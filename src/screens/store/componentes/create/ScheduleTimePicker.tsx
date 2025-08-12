import DateTimePicker from '@react-native-community/datetimepicker';
import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

const ScheduleTimePicker = ({ value, onChange }) => {
    const [showPicker, setShowPicker] = useState(false);

    const handleChange = (event, selectedDate) => {
        setShowPicker(false);
        if (selectedDate) {
            const hours = selectedDate.getHours().toString().padStart(2, '0');
            const minutes = selectedDate.getMinutes().toString().padStart(2, '0');
            onChange(`${hours}:${minutes}`);
        }
    };

    return (
        <View>
            <TouchableOpacity onPress={() => setShowPicker(true)} style={{ padding: 10, backgroundColor: '#333', borderRadius: 6 }}>
                <Text style={{ color: 'white' }}>{value || 'Selecciona hora'}</Text>
            </TouchableOpacity>
            {showPicker && (
                <DateTimePicker
                    value={value ? new Date(`1970-01-01T${value}:00`) : new Date()}
                    mode="time"
                    is24Hour={false}  // <-- aquí cambias a formato 12 horas
                    display="spinner"
                    onChange={handleChange}
                />
            )}
        </View>
    );
};

export default ScheduleTimePicker;