# tw_sba

## Español

tw_sba es una aplicación CLI capaz de aplicar la teoría de Scheduled Based Evidence utilizando Task Warrior, además de añadir otras funcionalidades.

### Características principales

- Integración con Task Warrior para gestión de tareas
- Implementación de simulación Monte Carlo para estimaciones de tareas
- Cálculo de probabilidades de completar tareas en intervalos de tiempo específicos
- Funcionalidades de línea de comandos para interactuar con la aplicación

### Requisitos

- Bun
- Task Warrior

### Requisitos de Task Warrior

- Tener instalado Task Warrior
- Tener dos UDA adicionales en Task Warrior: `estimate` y `activetime`
- Tener ya unas cuantas tareas terminadas para poder hacer la simulación con ambos UDAs

### Instalación

1. Clona este repositorio
2. Ejecuta `bun install` para instalar las dependencias

### Uso

Ejecuta `bun run dev` para iniciar la aplicación en modo desarrollo.
_Por ahora debes cambiar los parámetros de la simulación en el archivo `src/modules/services/MonteCarloSimulation.js` además que aún no hay CLI_ 

La aplicación puede proporcionar probabilidades de completar una tarea en diferentes intervalos de tiempo, ayudándote a planificar y estimar mejor tus proyectos.

## English

tw_sba is a CLI application capable of applying Scheduled Based Evidence theory using Task Warrior, along with additional functionalities.

### Main features

- Integration with Task Warrior for task management
- Implementation of Monte Carlo simulation for task estimations
- Calculation of probabilities for completing tasks within specific time intervals
- Command-line functionalities to interact with the application

### Requirements

- Bun
- Task Warrior

### Requirements of Task Warrior

- Have Task Warrior installed
- Have two additional UDA in Task Warrior: `estimate` and `activetime`
- Have already some tasks finished to be able to make the simulation with both UDAs

### Installation

1. Clone this repository
2. Run `bun install` to install dependencies

### Usage

Run `bun run dev` to start the application in development mode.
_For now you must change the parameters of the simulation in the `src/modules/services/MonteCarloSimulation.js` file, and also there is no CLI yet_

The application can provide probabilities of completing a task within different time intervals, helping you better plan and estimate your projects.

