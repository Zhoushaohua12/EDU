import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <section className="hero">
        <div className="hero__backdrop" aria-hidden="true" />
        <div className="hero__content">
          <p className="hero__brand">课径</p>
          <h1 className="hero__headline">人教版小学到初中，一条清晰的学习路径</h1>
          <p className="hero__lead">
            教材 PDF 来自 ChinaTextbook 开源库，按年级与科目整理人教/统编目录，配合导学自测与云端进度。
          </p>
          <div className="hero__actions">
            <Link className="btn btn-primary" href="/primary">
              进入小学
            </Link>
            <Link className="btn btn-ghost" href="/middle">
              进入初中
            </Link>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <h2 className="section__title">怎么学</h2>
          <p className="section__desc">
            选择学段与年级，进入科目单元，阅读导学后完成练习；登录后进度会保存在云端。
          </p>
          <div className="subject-grid">
            <div className="tile">
              <h3 className="tile__title">ChinaTextbook 教材</h3>
              <p className="tile__meta">对接人教/统编 PDF，一键打开电子课本</p>
            </div>
            <div className="tile">
              <h3 className="tile__title">导学 + 自测</h3>
              <p className="tile__meta">阅读建议与即时判分，辅助自学节奏</p>
            </div>
            <div className="tile">
              <h3 className="tile__title">云端进度</h3>
              <p className="tile__meta">注册登录后可在「我的进度」回顾完成情况</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
