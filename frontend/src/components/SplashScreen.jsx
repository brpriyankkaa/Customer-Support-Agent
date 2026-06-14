/**
 * SplashScreen
 * Matches the Angular app-loading / splashscreen from DevTools source lines 137-148.
 * Six bouncing dots (.circle.circle-N) plus the Capgemini wordmark.
 */
import { LOGO_SRC } from '../assets/images.js'

export default function SplashScreen({ visible }) {
  return (
    <div
      /* class="app-loading" id="app-loader" – mirrors source line 137 */
      className={[
        'fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white',
        'transition-opacity duration-500',
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none',
      ].join(' ')}
      aria-hidden={!visible}
    >
      {/* Capgemini logo */}
      <img
        src={LOGO_SRC}
        alt="Capgemini"
        className="h-10 mb-8 object-contain"
      />

      {/* class="splashscreen" > class="wrapper" – mirrors source lines 138-146 */}
      <div className="flex gap-2 items-end">
        {/* Six spans: class="circle circle-1" … class="circle circle-6" */}
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <span key={n} className="splash-dot" />
        ))}
      </div>
    </div>
  )
}
