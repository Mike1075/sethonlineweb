export default function TestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-seth-dark via-seth-primary to-seth-dark flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-seth-light mb-4">
          🔥 部署测试页面
        </h1>
        <p className="text-seth-light/70 text-xl">
          如果你能看到这个页面，说明部署成功了！
        </p>
        <p className="text-seth-accent mt-4">
          时间戳: {new Date().toLocaleString('zh-CN')}
        </p>
      </div>
    </div>
  )
} 