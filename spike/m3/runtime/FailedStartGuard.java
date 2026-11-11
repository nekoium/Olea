import java.io.*;
import java.lang.reflect.*;
import java.util.concurrent.TimeUnit;

// Off-device guard against compiled production Kotlin; no Android APIs are invoked.
public class FailedStartGuard {
  static class Child extends Process {
    boolean destroyed;
    public OutputStream getOutputStream() { return new ByteArrayOutputStream(); }
    public InputStream getInputStream() { return new ByteArrayInputStream(new byte[0]); }
    public InputStream getErrorStream() { return new ByteArrayInputStream(new byte[0]); }
    public int waitFor() { throw new IllegalThreadStateException(); }
    public boolean waitFor(long timeout, TimeUnit unit) { return false; }
    public int exitValue() { throw new IllegalThreadStateException(); }
    public void destroy() { destroyed = true; }
  }
  static Method method(Class<?> cls, String prefix) {
    for (Method m : cls.getDeclaredMethods()) if (m.getName().startsWith(prefix)) return m;
    throw new AssertionError("missing production method " + prefix);
  }
  public static void main(String[] args) throws Exception {
    Class<?> owner = Class.forName("dev.olea.spike.OwnedProcess");
    Object companion = owner.getField("Companion").get(null);
    Child child = new Child();
    Object failure = method(companion.getClass(),"stopFailedStart").invoke(companion,child,new IllegalStateException("fixture ownership unavailable"),true);
    if (!child.destroyed) throw new AssertionError("destroy not requested");
    if (!(Boolean)failure.getClass().getMethod("getGateNeverReleased").invoke(failure)) throw new AssertionError("gate distinction lost");
    if ((Boolean)failure.getClass().getMethod("getDirectChildExitObserved").invoke(failure)) throw new AssertionError("false wait became observed exit");
    Class<?> probe = Class.forName("dev.olea.spike.RuntimeProbe");
    Object instance = probe.getField("INSTANCE").get(null);
    Method cleanup = method(probe,"cleanupWithoutOwner");
    if ((Boolean)cleanup.invoke(instance,false,failure)) throw new AssertionError("unobserved exit verified cleanup");
    if ((Boolean)cleanup.invoke(instance,false,null)) throw new AssertionError("null owner verified cleanup");
    if (!(Boolean)cleanup.invoke(instance,true,null)) throw new AssertionError("suppressed launch lost no-child distinction");
    System.out.println("PASS compiled production failed-start guard: destroy requested, waitFor=false retained, closed gate is not exit, null owner does not verify cleanup, deliberate suppression distinguished");
  }
}
