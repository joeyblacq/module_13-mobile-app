# module_13-mobile-app
 Rocket Food Delivery, a newly established food delivery service, 
 # 📱 Mobile Application Research

## 🔹 Difference Between Native and Cross-Platform Mobile Applications

  -----------------------------------------------------------------------
  Aspect                  **Native Application**  **Cross-Platform
                                                  Application**
  ----------------------- ----------------------- -----------------------
  **Definition**          Built specifically for  Built from a single
                          one platform (like      codebase that runs on
                          Android or iOS) using   multiple platforms
                          that platform's native  (Android, iOS, etc.)
                          programming language    using a common
                          and tools.              framework.

  **Languages Used**      Android → Java/Kotlin;  React Native →
                          iOS → Swift/Objective-C JavaScript, Flutter →
                                                  Dart, Xamarin → C#,
                                                  etc.

  **Performance**         Excellent, because the  Slightly lower than
                          code directly uses      native because the
                          device hardware and OS  framework adds an
                          APIs.                   abstraction layer.

  **User Interface (UI)** Uses platform-specific  Framework provides
                          UI components, giving a shared UI components
                          natural look and feel.  that imitate native
                                                  elements.

  **Development Time**    Longer --- requires two Faster --- one shared
                          separate apps for       codebase for both
                          Android and iOS.        platforms.

  **Maintenance**         Each version must be    Easier to maintain ---
                          updated separately.     one update affects all
                                                  platforms.

  **Access to Device      Full access (camera,    May need native plugins
  Features**              GPS, sensors, etc.)     or bridges for some
                                                  features.
  -----------------------------------------------------------------------

**Summary:**\
Native apps provide the best performance and platform experience, but
cross-platform apps are cheaper and faster to develop because they share
most of the code.

------------------------------------------------------------------------

## 🔹 Difference Between React Native and React

  ----------------------------------------------------------------------------
  Aspect                  **React**               **React Native**
  ----------------------- ----------------------- ----------------------------
  **Purpose**             Used for building       Used for building **mobile**
                          **web** applications.   applications (Android and
                                                  iOS).

  **Platform**            Runs in a web browser.  Runs on mobile devices as
                                                  native apps.

  **Rendering**           Uses **HTML** and       Uses **native mobile
                          **CSS** to render       components** like `<View>`,
                          elements on the         `<Text>`, and `<Image>`
                          **DOM**.                instead of HTML.

  **Styling**             Uses traditional CSS or Uses a JavaScript-based
                          frameworks like         styling system (StyleSheet)
                          Tailwind or Bootstrap.  similar to CSS but not
                                                  identical.

  **Navigation**          Uses `react-router-dom` Uses
                          for web navigation.     `@react-navigation/native`
                                                  or other mobile navigation
                                                  libraries.

  **Output**              Website accessible via  Mobile app installable on
                          browser.                iOS/Android.
  ----------------------------------------------------------------------------

**Summary:**\
React builds websites, while React Native builds mobile apps --- both
share the same React principles (components, props, state), but render
to different platforms.

