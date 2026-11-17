# Nuvinha App ☁️

Aplicativo Expo/React Native da Nuvinha, com pet animado, conversa, jogos e loja.


## Nuvinha Sky e carteira de moedas

- O jogo é uma subida vertical até a Lua, sem plataformas, com aviões, pássaros, balões, asteroides e moedas. Os obstáculos aceleram gradualmente conforme a altitude.
- A carteira é compartilhada entre **Cuidar**, **Jogos** e **Loja**. Cada moeda é registrada durante a partida, e os itens comprados ficam salvos e podem ser equipados.
- Na web, o saldo é salvo no `localStorage`; no iOS/Android, em um arquivo no diretório privado do app. A carteira é local ao dispositivo/navegador — o cliente atual só consulta o pet na API e não possui uma rota conhecida para sincronizar alterações de moedas com o servidor Django.

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

### Other setup steps

- To set up ESLint for linting, run `npx expo lint`, or follow our guide on ["Using ESLint and Prettier"](https://docs.expo.dev/guides/using-eslint/)
- If you'd like to set up unit testing, follow our guide on ["Unit Testing with Jest"](https://docs.expo.dev/develop/unit-testing/)
- Learn more about the TypeScript setup in this template in our guide on ["Using TypeScript"](https://docs.expo.dev/guides/typescript/)

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
