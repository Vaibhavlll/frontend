import Image from 'next/image'

export default function PricingSection2() {
    return (
        <section className="price_plan_area section_padding_130_80" id="pricing">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-8 col-lg-6">
            <div className="section-heading text-center wow fadeInUp" data-wow-delay="0.2s" style={{visibility: 'visible', animationDelay: '0.2s', animationName: 'fadeInUp'}}>
              <h6>Pricing Plans</h6>
              <h3>Let&quot;s find a way together</h3>
              <p>Appland is completely creative, lightweight, clean &amp; super responsive app landing page.</p>
              <div className="line"></div>
            </div>
          </div>
        </div>
        <div className="row justify-content-center">
          <div className="col-12 col-sm-8 col-md-6 col-lg-4">
            <div className="single_price_plan wow fadeInUp" data-wow-delay="0.2s" style={{visibility: 'visible', animationDelay: '0.2s', animationName: 'fadeInUp'}}>
              <div className="title">
                <h3>Start Up</h3>
                <p>Start a trial</p>
                <div className="line"></div>
              </div>
              <div className="price">
                <h4>$0</h4>
              </div>
              <div className="description">
                <p><i className="lni lni-checkmark-circle"></i>Duration: 7days</p>
                <p><i className="lni lni-checkmark-circle"></i>10 Features</p>
                <p><i className="lni lni-close"></i>No Hidden Fees</p>
                <p><i className="lni lni-close"></i>100+ Video Tuts</p>
                <p><i className="lni lni-close"></i>No Tools</p>
              </div>
              <div className="button"><a className="btn btn-success btn-2" href="#">Get Started</a></div>
            </div>
          </div>
          <div className="col-12 col-sm-8 col-md-6 col-lg-4">
            <div className="single_price_plan active wow fadeInUp" data-wow-delay="0.2s" style={{visibility: 'visible', animationDelay: '0.2s', animationName: 'fadeInUp'}}>
              <div className="side-shape"><Image src="https://bootdey.com/img/popular-pricing.png" alt="" width={50} height={50}/></div>
              <div className="title"><span>Popular</span>
                <h3>Small Business</h3>
                <p>For Small Business Team</p>
                <div className="line"></div>
              </div>
              <div className="price">
                <h4>$9.99</h4>
              </div>
              <div className="description">
                <p><i className="lni lni-checkmark-circle"></i>Duration: 3 Month</p>
                <p><i className="lni lni-checkmark-circle"></i>50 Features</p>
                <p><i className="lni lni-checkmark-circle"></i>No Hidden Fees</p>
                <p><i className="lni lni-checkmark-circle"></i>150+ Video Tuts</p>
                <p><i className="lni lni-close"></i>5 Tools</p>
              </div>
              <div className="button"><a className="btn btn-warning" href="#">Get Started</a></div>
            </div>
          </div>
          <div className="col-12 col-sm-8 col-md-6 col-lg-4">
            <div className="single_price_plan wow fadeInUp" data-wow-delay="0.2s" style={{visibility: 'visible', animationDelay: '0.2s', animationName: 'fadeInUp'}}>
              <div className="title">
                <h3>Enterprise</h3>
                <p>Unlimited Possibilities</p>
                <div className="line"></div>
              </div>
              <div className="price">
                <h4>$49.99</h4>
              </div>
              <div className="description">
                <p><i className="lni lni-checkmark-circle"></i>Duration: 1 year</p>
                <p><i className="lni lni-checkmark-circle"></i>Unlimited Features</p>
                <p><i className="lni lni-checkmark-circle"></i>No Hidden Fees</p>
                <p><i className="lni lni-checkmark-circle"></i>Unlimited Video Tuts</p>
                <p><i className="lni lni-checkmark-circle"></i>Unlimited Tools</p>
              </div>
              <div className="button"><a className="btn btn-info" href="#">Get Started</a></div>
            </div>
          </div>
        </div>
      </div>
    </section>
    )
}