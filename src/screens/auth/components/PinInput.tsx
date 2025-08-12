import React, { useRef, useState } from 'react';
import { TextInput, View } from 'react-native';
import tw from 'twrnc';
import { COLORS } from '../../../../theme';

interface Props {
  pin: string[];
  setPin: (pin: string[]) => void;
  hasError?: boolean;
}

const PinInput: React.FC<Props> = ({ pin, setPin, hasError = false }) => {
  const inputs = useRef<TextInput[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const handlePinChange = (text: string, index: number) => {
    const char = text.replace(/\D/g, '').slice(-1);
    const newPin = [...pin];
    newPin[index] = char;
    setPin(newPin);

    if (char && index < pin.length - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (pin[index] === '' && index > 0) {
        const newPin = [...pin];
        newPin[index - 1] = '';
        setPin(newPin);
        inputs.current[index - 1]?.focus();
      }
    }
  };

  return (
    <View style={tw`flex-row justify-center mb-6`}>
      {pin.map((value, index) => (
        <View key={index} style={tw`mx-2`}>
          <TextInput
            ref={el => (inputs.current[index] = el!)}
            value={value ? '●' : ''}
            onChangeText={text => handlePinChange(text, index)}
            onKeyPress={e => handleKeyPress(e, index)}
            maxLength={1}
            keyboardType="numeric"
            onFocus={() => setFocusedIndex(index)}
            onBlur={() => setFocusedIndex(null)}
            style={tw.style(
              `w-10 h-12 text-2xl text-white text-center`,
              'border-b-2',
              hasError
                ? 'border-red-500'
                : focusedIndex === index
                ? { borderColor: COLORS.BlueSkyWord }
                : 'border-white',
              { outlineWidth: 0 }
            )}
            caretHidden={true}
          />
        </View>
      ))}
    </View>
  );
};

export default PinInput;
