import { describe, it, expect } from "vitest";
import { renderToString } from "react-dom/server";
import { DashboardProfileAvatar } from "../DashboardProfileAvatar";

describe("DashboardProfileAvatar", () => {
  it("renders image when avatarUrl is provided", () => {
    const html = renderToString(
      <DashboardProfileAvatar
        avatarUrl="https://example.com/avatar.jpg"
        name="Sehan Alfarisi"
        variant="kreator"
      />
    );

    expect(html).toContain("avatar.jpg");
    expect(html).toContain('alt="Sehan Alfarisi"');
  });

  it("renders first letter of name when avatarUrl is absent", () => {
    const html = renderToString(
      <DashboardProfileAvatar
        avatarUrl={null}
        name="Sehan Alfarisi"
        variant="kreator"
      />
    );

    expect(html).toContain("<span>S</span>");
  });

  it("renders neutral fallback ? when name and avatarUrl are absent", () => {
    const html = renderToString(
      <DashboardProfileAvatar
        avatarUrl=""
        name=""
        variant="umkm"
      />
    );

    expect(html).toContain("<span>?</span>");
  });

  it("trims whitespace before picking initial", () => {
    const html = renderToString(
      <DashboardProfileAvatar
        avatarUrl=""
        name="  Dapur Sehat  "
        variant="umkm"
      />
    );

    expect(html).toContain("<span>D</span>");
  });
});
