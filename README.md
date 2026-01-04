# whutjwxk

适用于 WHUT 新版教务系统的选课辅助程序。

基于 Tauri + React + Rust 构建，提供更流畅的交互体验和强大的辅助功能。

## ✨ 功能特点

- **可视化选课**：全新的用户界面，操作更加直观便捷；
- **自动抢课**：支持多课程批量监控与自动捡漏，解放双手；
- **课程管理**：支持添加、删除课程，一键管理选课计划；
- **跨平台**：目前支持 Windows 和 MacOS (Apple Silicon)。

## 🚀 下载使用

前往 [Release](https://github.com/zhxycn/whutjwxk/releases) 页面下载最新版本的程序。

若您在使用过程中遇到任何问题，欢迎提交 [Issue](https://github.com/zhxycn/whutjwxk/issues)。

### 小提示

由于程序未经签名，在运行时可能会出现安全警告。

对于 Windows 10/11 用户，若 Windows Defender 对程序进行了拦截，请在安全设置中添加例外。

对于 MacOS 用户，若提示 “程序已损坏，无法打开”，请在终端中运行以下命令：

```bash
xattr -cr Applications/whutjwxk.app
```

若您自定义了程序的安装路径，请将命令中的 `Applications/whutjwxk.app` 替换为您的实际安装路径。

## 🛠️ 继续开发

```bash
bun install
bun tauri dev
bun tauri build
```

## ⚠️ 免责声明

本程序代码虽然公开，但不使用任何开源许可证。这意味着：

1. 您可以查看代码用于学习和个人使用；
2. 未经作者明确授权，严禁将本程序用于任何商业用途、分发、修改或再发布；
3. 请勿利用本程序对服务器等资源进行恶意攻击；
4. 使用本程序产生的任何后果由用户自行承担。
