const GOOGLE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzZY8aTVJoK9skLqOcJbQSuTGzCeSPCCj_DW1sdSVI-UkISa3TDVuHTTPvrpYAwIMetYw/exec";

export interface StudentProgressData {
  goldStars: number;
  level: string;
  completedUnit: string;
}

export async function fetchStudentProgress(username: string): Promise<StudentProgressData> {
  const defaultData: StudentProgressData = {
    goldStars: 0,
    level: "Level 1",
    completedUnit: "Unit 0",
  };

  if (!username) {
    localStorage.setItem("goldStars", String(defaultData.goldStars));
    localStorage.setItem("level", defaultData.level);
    localStorage.setItem("completedUnit", defaultData.completedUnit);
    return defaultData;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        action: "getProgress",
        username: username.trim(),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      localStorage.setItem("goldStars", String(defaultData.goldStars));
      localStorage.setItem("level", defaultData.level);
      localStorage.setItem("completedUnit", defaultData.completedUnit);
      return defaultData;
    }

    let data: any;
    try {
      data = await response.json();
    } catch {
      localStorage.setItem("goldStars", String(defaultData.goldStars));
      localStorage.setItem("level", defaultData.level);
      localStorage.setItem("completedUnit", defaultData.completedUnit);
      return defaultData;
    }

    if (data && data.success) {
      const parsedStars = parseInt(data.goldStars, 10);
      const goldStars = isNaN(parsedStars) ? 0 : parsedStars;
      const level = data.level ? String(data.level) : "Level 1";
      const completedUnit = data.completedUnit ? String(data.completedUnit) : "Unit 0";

      // Save to localStorage
      localStorage.setItem("goldStars", String(goldStars));
      localStorage.setItem("level", level);
      localStorage.setItem("completedUnit", completedUnit);

      return {
        goldStars,
        level,
        completedUnit,
      };
    } else {
      localStorage.setItem("goldStars", String(defaultData.goldStars));
      localStorage.setItem("level", defaultData.level);
      localStorage.setItem("completedUnit", defaultData.completedUnit);
      return defaultData;
    }
  } catch (err) {
    clearTimeout(timeoutId);
    // Return defaults safely if network or fetch fails
    localStorage.setItem("goldStars", String(defaultData.goldStars));
    localStorage.setItem("level", defaultData.level);
    localStorage.setItem("completedUnit", defaultData.completedUnit);
    return defaultData;
  }
}

export async function updateStudentProgress(
  username: string,
  studentName: string,
  goldStars: number,
  level: string,
  completedUnit: string
): Promise<boolean> {
  if (!username) return false;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify({
        action: "updateProgress",
        username: username.trim(),
        studentName: studentName || username.trim(),
        goldStars: goldStars,
        level: level,
        completedUnit: completedUnit,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) return false;

    let data: any;
    try {
      data = await response.json();
    } catch {
      return false;
    }

    if (data && data.success) {
      localStorage.setItem("goldStars", String(goldStars));
      localStorage.setItem("level", level);
      localStorage.setItem("completedUnit", completedUnit);
      return true;
    }
    return false;
  } catch (err) {
    clearTimeout(timeoutId);
    // Silent fail on network error - no crash, no alert, no logout
    return false;
  }
}
