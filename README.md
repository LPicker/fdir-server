# fdir-server

基于 HTTP 协议实现的文件服务器，支持目录浏览和文件预览。

## 视频简介

[![fdir-server 介绍](https://raw.githubusercontent.com/LPicker/fdir-server/master/intro.gif)](https://www.bilibili.com/video/BV1cwXrBmEWb)

📺 [在 B 站查看视频介绍](https://www.bilibili.com/video/BV1cwXrBmEWb)

## 功能特性

- 目录浏览：以列表形式展示目录结构
- 文件预览：支持多种文本文件类型的在线预览
- 支持 HEAD 请求方法
- 简洁的 Web 界面

## 安装

```bash
npm install -g fdir-server
```

## 使用方法

### 作为全局命令使用

安装后，可以在任意目录运行：

```bash
fdir [port] [directory]
```

### 参数说明

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `port` | 服务器端口 | 8080 |
| `directory` | 要服务的目录 | 当前目录 |

### 使用示例

```bash
# 在当前目录启动服务器，使用默认端口 8080
fdir

# 指定端口为 3000
fdir 3000

# 指定服务目录和端口
fdir 3000 /path/to/your/files

# 同时指定端口和目录
fdir 8080 ./public
```

### 作为模块使用

```javascript
import Server from 'fdir-server';

const server = new Server(8080, './public');
server.start();
```

## 访问服务

启动后，在浏览器中访问：

```
http://localhost:<port>/
```

## 开发

```bash
# 安装依赖
npm install

# 构建项目
npm run build

# 开发模式运行
npm run dev

# 运行 lint
npm run lint
npm run lint:fix

# 格式化代码
npm run fmt
npm run fmt:check
```

## 技术栈

- **语言**: TypeScript
- **运行时**: Node.js
- **构建**: tsc

## 许可证

ISC
