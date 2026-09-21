# Rita 的酒馆后台保活音频

一个给 SillyTavern 移动端使用的前端扩展。

## 功能

点击“🔇 开启保活”后，扩展会播放极低音量的循环背景音频，并设置 Media Session。这样切换到其他 App 时，浏览器更有机会继续保持酒馆的生成请求。

这不是服务器端任务队列，iOS 仍可能因为系统资源管理而暂停页面，因此不能保证所有情况下都不中断。

## 安装

在 SillyTavern 中打开“扩展程序 → 安装扩展程序”，粘贴本仓库地址：

https://github.com/rita090qwq/rita-sillytavern-background-audio

安装后刷新页面，在扩展面板中打开“后台保活音频”，点击“开启保活”。

## 文件

- manifest.json：酒馆扩展清单
- index.js：音频与 Media Session 逻辑
- style.css：按钮样式

## 许可

MIT License
