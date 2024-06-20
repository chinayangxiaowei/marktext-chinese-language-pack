# marktext-chinese-language-pack

Simplified Chinese language pack for marktext

marktext 简体中文汉化包

###### 更新内容：

1. 通过资源替换方式，修复MacOS下导入文档与图床上传失败的Bug；
2. 加入自动翻译脚本，在编译的时候自动翻译。
3. 优化main.js中Label标记的搜索与匹配

###### 当前状态：

        本预计发布多国语版本，考虑修改地方太多后期与官方代码同步将是非常繁重的任务，正在寻求一个更好的源码同步方案，暂不发布多国语版本。不过先把资源翻译代码开源，有兴趣的可以尝试自己编译所需要的操作系统版本。

        如果其它国家的朋友也需要自己的语言包，可以翻译translate-resources/xxx_zh-cn.txt文件并命名为translate-resources/xxx_[lang].txt，编译时请设置环境变量lang=你的语言缩写，如果你希望分享你的翻译成果，可以在[Issues](https://github.com/chinayangxiaowei/marktext-chinese-language-pack/issues)提交报告。

###### 下载地址：

[Releases ](https://github.com/chinayangxiaowei/marktext-chinese-language-pack/releases)

###### 编译方法：

```bash
1. 复制项目文件夹文件到marktext官方源码目录，其中“\.electron-vue\build.js”文件会被替换。
2. 安装项目依赖
yarn install
3. 安装ts依赖
yarn add ts-node
yarn add typescript
4. 设置语言
windows：
set lang=zh-cn
mac or linux:
export lang=zh-cn
5. 编译
yarn build
```
