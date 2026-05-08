import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import (
    InputLayer,
    TimeDistributed,
    Conv2D,
    MaxPooling2D,
    Flatten,
    LSTM,
    Dropout,
    Dense
)

def build_pulsenet():
    model = Sequential()

    model.add(InputLayer(input_shape=(60, 128, 128, 3)))

    model.add(TimeDistributed(Conv2D(16, (3,3), activation='relu')))
    model.add(TimeDistributed(MaxPooling2D()))

    model.add(TimeDistributed(Conv2D(32, (3,3), activation='relu')))
    model.add(TimeDistributed(MaxPooling2D()))

    model.add(TimeDistributed(Conv2D(64, (3,3), activation='relu')))
    model.add(TimeDistributed(MaxPooling2D()))

    model.add(TimeDistributed(Flatten()))

    model.add(LSTM(64))

    model.add(Dropout(0.3))

    model.add(Dense(32, activation='relu'))
    model.add(Dense(1, activation='linear'))

    return model