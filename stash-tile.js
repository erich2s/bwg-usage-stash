// Stash tile argument: {"name":"BWG 数据用量","BWG_VEID":"1234567","BWG_API_KEY":"your-api-key"}
const tile = {
  title: "BWG 数据用量",
  icon: "network",
  backgroundColor: "#F02D55",
};

const finish = (content) => $done({ ...tile, content });

const formatGB = (bytes) => `${Number((bytes / 1024 ** 3).toFixed(2))} GB`;
const formatResetDate = (timestamp) => {
  if (!Number.isFinite(Number(timestamp)) || Number(timestamp) <= 0) return "";

  const date = new Date(timestamp * 1000);
  if (!Number.isFinite(date.getTime())) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}/${day}`;
};

const readNumber = (value) =>
  typeof value === "number" || (typeof value === "string" && value.trim() !== "")
    ? Number(value)
    : NaN;

const main = () => {
  let options;
  try {
    options = JSON.parse(typeof $argument === "string" ? $argument : "{}");
  } catch {
    finish("argument 必须是 JSON 对象");
    return;
  }

  if (options === null || typeof options !== "object" || Array.isArray(options)) {
    finish("argument 必须是 JSON 对象");
    return;
  }

  if (typeof options.name === "string" && options.name.trim()) {
    tile.title = options.name.trim();
  }

  const veid =
    typeof options.BWG_VEID === "string" || typeof options.BWG_VEID === "number"
      ? String(options.BWG_VEID).trim()
      : "";
  const apiKey = typeof options.BWG_API_KEY === "string" ? options.BWG_API_KEY.trim() : "";
  if (!veid || !apiKey) {
    finish("请配置 BWG_VEID 和 BWG_API_KEY");
    return;
  }

  $httpClient.post(
    {
      url: "https://api.64clouds.com/v1/getServiceInfo",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `veid=${encodeURIComponent(veid)}&api_key=${encodeURIComponent(apiKey)}`,
      timeout: 5,
      "auto-redirect": false,
    },
    (error, response, body) => {
      if (error) {
        finish("获取流量失败");
        return;
      }

      const status = Number(response?.status ?? response?.statusCode);
      if (status !== 200) {
        finish(`HTTP ${Number.isFinite(status) ? status : "Unknown"}`);
        return;
      }

      let usage;
      try {
        usage = JSON.parse(body);
      } catch {
        finish("数据解析失败");
        return;
      }

      if (usage === null || typeof usage !== "object" || Array.isArray(usage)) {
        finish("流量数据异常");
        return;
      }

      if (usage.error !== undefined && Number(usage.error) !== 0) {
        const code = readNumber(usage.error);
        finish(Number.isFinite(code) ? `BWG API 错误 ${code}` : "BWG API 错误");
        return;
      }

      const used = readNumber(usage.data_counter);
      const multiplier = readNumber(usage.monthly_data_multiplier);
      const total =
        readNumber(usage.plan_monthly_data) *
        (Number.isFinite(multiplier) && multiplier > 0 ? multiplier : 1);

      if (!Number.isFinite(used) || !Number.isFinite(total) || used < 0 || total <= 0) {
        finish("流量数据异常");
        return;
      }

      const reset = formatResetDate(usage.data_next_reset);
      const content = [`${formatGB(used)}/${formatGB(total)}`, reset && `${reset} 重置`]
        .filter(Boolean)
        .join("\n");

      finish(content);
    },
  );
};

main();
