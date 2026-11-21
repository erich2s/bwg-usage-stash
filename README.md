# BWG 数据用量

在 Stash 首页以卡片显示搬瓦工（BandwagonHost）VPS 的已用流量、总流量和下次重置日期，支持自定义卡片名称。

<img width="1206" height="465" alt="IMG_9943" src="https://github.com/user-attachments/assets/d8f5ec98-33ea-4733-afe7-1dbb97e26097" />

## 使用方法

> [!NOTE]
> 参数化面板仅支持 Stash 5.0 及以上版本。

1. 在 Stash 的「覆写」中添加以下远程覆写：

   ```text
   https://raw.githubusercontent.com/erich2s/bwg-usage-stash/main/stash-tile.stoverride
   ```

2. 在覆写参数中填写 VPS 的 `BWG_VEID` 和 `BWG_API_KEY`，可在 KiwiVM 控制面板获取。
3. 按需修改 `name`，保存并启用覆写。

## 参数

| 参数 | 说明 | 默认值 |
| --- | --- | --- |
| `name` | 卡片标题 | `BWG 数据用量` |
| `BWG_VEID` | VPS 的 VEID，必填 | 无 |
| `BWG_API_KEY` | VPS 的 API Key，必填 | 无 |

用量卡片每 12 小时刷新一次，脚本每 24 小时检查更新。流量按 1024³ 字节换算，重置日期按设备本地时区显示。

