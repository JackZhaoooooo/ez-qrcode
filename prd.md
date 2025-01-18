# 项目需求文档
- 一个谷歌插件，二维码生成器，容器高度500px，宽度600px
## 技术栈
- 前端：react、vite、tailwindcss、semi-design、pnpm
## 模块
### 二维码模块
- 左右布局
  - 左边是二维码图片，根据右边的链接实时生成
  - 右边是纵向布局
    - 名称：输入框, 无label，placeholder：请输入名称，默认值是当前网页的title
    - 链接：输入框，无label，placeholder：请输入链接，默认值是当前网页的url
    - 收藏按钮：点击后，将二维码信息保存到本地，并显示在下面列表中
### 收藏列表模块
- 使用table组件
- 列表项：
  - 横向布局，依次是
    - 名称
      - 内容：当前项的名称，显示蓝链
      - 事件：
        - click： 跳转到当前项的链接
    - 操作栏，依次是
      - 二维码icon：
        - 事件：
          - hover：，显示当前项的二维码
      - 下载icon：
        - 事件：
          - click：下载当前项的二维码图片
      - 编辑icon：
        - 事件：
          - click：展示SideSheet组件，SideSheet组件内容是当前项的二维码信息
            - SideSheet组件内容
              - 名称：输入框，无label，placeholder：请输入名称，默认值是当前项的名称
              - 链接：输入框，无label，placeholder：请输入链接，默认值是当前项的链接
              - 更新按钮：按钮名：更新，点击后，保存当前项的二维码信息
      - 复制icon：
        - 事件：
          - click：复制当前项的链接 
      - 删除icon：
        - 事件：
          - click：删除当前项


