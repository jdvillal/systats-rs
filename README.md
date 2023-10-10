# Systats-rs

Cross platform resource monitor.

![Screenshot from 2023-10-10 08-08-01](https://github.com/jdvillal/systats-rs/assets/57422146/923caec8-794b-4261-9e30-71538e6c2984)

Dark mode is also supported.

![Screenshot from 2023-10-10 08-09-03](https://github.com/jdvillal/systats-rs/assets/57422146/69bf7a0c-1f94-49c1-b149-eeeb0703ca9b)

Systats-rs allows you to visualize the utilization of your computer resources the same way in different platforms.


##
Currently, with systats-rs you can monitor:
*  CPU usage
*  Memory usage
*  Storage usage
*  Runnig processes

Individual process and GPU monitoring are not supported yet, but are on the way.

I'm also working on a mobile version. 

## Developed with Tauri

NodeJS and Rust-Cargo are required for building.

Install dependencies with
```
npm install
```
Then you can start the app in developing mode with
```
npm run tauri dev
```
Or build in release mode with
```
npm run tauri build
```

On linux, you might need to install other dependencies. Check https://tauri.app/v1/guides/getting-started/prerequisites#setting-up-linux for more information.


## Further help

Please consider this as a proof of concept. This is not a production ready software and there a lot of things that can be improved, so use it at your own risk.

If you find a bug, please report it opening a new issue.

Also, ideas for new features and contrinutions are welcome.
