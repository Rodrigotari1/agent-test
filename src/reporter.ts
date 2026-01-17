import { TestResult } from './types';

export interface Reporter {
  onStart(testCount: number): void;
  onTestStart(testName: string): void;
  onTestComplete(result: TestResult): void;
  onComplete(results: TestResult[]): void;
}

export class DefaultReporter implements Reporter {
  private startTime: number = 0;

  onStart(testCount: number): void {
    this.startTime = Date.now();
    console.log(`\nRunning ${testCount} test${testCount === 1 ? '' : 's'}...\n`);
  }

  onTestStart(): void {
  }

  onTestComplete(result: TestResult): void {
    const icon = result.passed ? '✓' : '✗';
    const duration = result.durationMs ? ` (${result.durationMs}ms)` : '';
    console.log(`  ${icon} ${result.name}${duration}`);

    if (result.error) {
      console.log(`    ${result.error.message}`);
    }
  }

  onComplete(results: TestResult[]): void {
    const passed = results.filter(r => r.passed).length;
    const failed = results.length - passed;
    const totalDuration = Date.now() - this.startTime;

    console.log();
    if (failed > 0) {
      console.log(`Tests: ${passed} passed, ${failed} failed, ${results.length} total`);
    } else {
      console.log(`Tests: ${passed} passed, ${results.length} total`);
    }
    console.log(`Time:  ${totalDuration}ms`);
  }
}

export class VerboseReporter implements Reporter {
  private startTime: number = 0;

  onStart(testCount: number): void {
    this.startTime = Date.now();
    console.log(`\nRunning ${testCount} test${testCount === 1 ? '' : 's'}...\n`);
  }

  onTestStart(testName: string): void {
    console.log(`\n▶ ${testName}`);
  }

  onTestComplete(result: TestResult): void {
    const icon = result.passed ? '✓' : '✗';
    const duration = result.durationMs ? ` (${result.durationMs}ms)` : '';
    console.log(`  ${icon} ${result.passed ? 'PASS' : 'FAIL'}${duration}`);

    if (result.error) {
      console.log(`\n  Error: ${result.error.message}`);
      if (result.error.stack) {
        console.log(result.error.stack.split('\n').slice(1, 4).join('\n'));
      }
    }

    if (result.tokens) {
      console.log(`  Tokens: ${result.tokens.total} (${result.tokens.prompt}p + ${result.tokens.completion}c)`);
    }
  }

  onComplete(results: TestResult[]): void {
    const passed = results.filter(r => r.passed).length;
    const failed = results.length - passed;
    const totalDuration = Date.now() - this.startTime;
    const totalTokens = results.reduce((sum, r) => sum + (r.tokens?.total || 0), 0);

    console.log('\n' + '='.repeat(50));
    if (failed > 0) {
      console.log(`Tests: ${passed} passed, ${failed} failed, ${results.length} total`);
    } else {
      console.log(`Tests: ${passed} passed, ${results.length} total`);
    }
    console.log(`Time:  ${totalDuration}ms`);
    if (totalTokens > 0) {
      console.log(`Tokens: ${totalTokens}`);
    }
  }
}

export class MinimalReporter implements Reporter {
  onStart(): void {
  }

  onTestStart(): void {
  }

  onTestComplete(result: TestResult): void {
    process.stdout.write(result.passed ? '.' : 'F');
  }

  onComplete(results: TestResult[]): void {
    const passed = results.filter(r => r.passed).length;
    const failed = results.length - passed;

    console.log(`\n\n${passed}/${results.length} passed`);

    if (failed > 0) {
      console.log('\nFailures:');
      results.filter(r => !r.passed).forEach(r => {
        console.log(`  - ${r.name}`);
        if (r.error) {
          console.log(`    ${r.error.message}`);
        }
      });
    }
  }
}

export class JSONReporter implements Reporter {
  private results: TestResult[] = [];
  private startTime: number = 0;

  onStart(): void {
    this.startTime = Date.now();
  }

  onTestStart(): void {
  }

  onTestComplete(result: TestResult): void {
    this.results.push(result);
  }

  onComplete(results: TestResult[]): void {
    const output = {
      passed: results.filter(r => r.passed).length,
      failed: results.filter(r => !r.passed).length,
      total: results.length,
      duration: Date.now() - this.startTime,
      tests: results.map(r => ({
        name: r.name,
        passed: r.passed,
        duration: r.durationMs,
        tokens: r.tokens,
        error: r.error ? {
          message: r.error.message,
          stack: r.error.stack
        } : undefined
      }))
    };

    console.log(JSON.stringify(output, null, 2));
  }
}
