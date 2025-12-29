#!/usr/bin/env python3
"""
Qwen-Code Test Suite and Comparison Framework
Tests coding tasks and compares with Claude Code results
"""

import json
import time
import subprocess
from pathlib import Path
from datetime import datetime

# Test cases for evaluating coding assistant performance
TEST_CASES = [
    {
        "id": "test_1_simple_function",
        "category": "Code Generation",
        "difficulty": "Easy",
        "instruction": "Write a Python function that calculates the factorial of a number using recursion.",
        "evaluation_criteria": ["Correct logic", "Handles edge cases", "Has docstring", "Clean code"]
    },
    {
        "id": "test_2_error_handling",
        "category": "Error Handling",
        "difficulty": "Medium",
        "instruction": "Add comprehensive error handling to this function that reads a JSON file and returns the data.",
        "context_file": None,  # Would include actual file
        "evaluation_criteria": ["Try-except blocks", "Specific exceptions", "Error messages", "File handling"]
    },
    {
        "id": "test_3_optimization",
        "category": "Code Optimization",
        "difficulty": "Medium",
        "instruction": "Optimize this nested loop that finds duplicate numbers in a list. The current O(n²) solution is too slow.",
        "evaluation_criteria": ["Better time complexity", "Uses appropriate data structures", "Maintains correctness"]
    },
    {
        "id": "test_4_debugging",
        "category": "Debugging",
        "difficulty": "Medium",
        "instruction": "Find and fix the bug in this code that should reverse a string but returns incorrect results.",
        "evaluation_criteria": ["Identifies bug", "Explains the issue", "Provides fix", "Tests edge cases"]
    },
    {
        "id": "test_5_api_design",
        "category": "Architecture",
        "difficulty": "Hard",
        "instruction": "Design a REST API endpoint for user authentication with JWT tokens. Include error handling and rate limiting.",
        "evaluation_criteria": ["Complete design", "Security considerations", "Error handling", "Rate limiting", "Documentation"]
    },
    {
        "id": "test_6_refactoring",
        "category": "Refactoring",
        "difficulty": "Medium",
        "instruction": "Refactor this 200-line function into smaller, more maintainable functions following SOLID principles.",
        "evaluation_criteria": ["Better structure", "Single responsibility", "Improved readability", "Maintains functionality"]
    },
    {
        "id": "test_7_async_code",
        "category": "Async Programming",
        "difficulty": "Hard",
        "instruction": "Convert this synchronous code that makes multiple API calls into async/await pattern for better performance.",
        "evaluation_criteria": ["Correct async/await usage", "Error handling", "Performance improvement", "Clean code"]
    },
    {
        "id": "test_8_testing",
        "category": "Testing",
        "difficulty": "Medium",
        "instruction": "Write comprehensive unit tests for this user registration function including edge cases and error scenarios.",
        "evaluation_criteria": ["Test coverage", "Edge cases", "Mocking", "Clear test names", "Assertions"]
    }
]

class TestRunner:
    def __init__(self, model="qwen2.5-coder:7b"):
        self.model = model
        self.results = []
        self.output_dir = Path("qwen-test-results")
        self.output_dir.mkdir(exist_ok=True)

    def run_test(self, test_case):
        """Run a single test case"""
        print(f"\n{'='*70}")
        print(f"TEST: {test_case['id']}")
        print(f"Category: {test_case['category']} | Difficulty: {test_case['difficulty']}")
        print(f"{'='*70}\n")
        print(f"Instruction: {test_case['instruction']}\n")

        # Measure response time
        start_time = time.time()

        # Run qwen-code
        cmd = ['./qwen-code', '--no-context', '--model', self.model, test_case['instruction']]
        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=120
            )
            response = result.stdout
            response_time = time.time() - start_time

            print(f"\n\nResponse Time: {response_time:.2f}s")

            # Save result
            test_result = {
                'test_id': test_case['id'],
                'category': test_case['category'],
                'difficulty': test_case['difficulty'],
                'instruction': test_case['instruction'],
                'model': self.model,
                'response': response,
                'response_time': response_time,
                'timestamp': datetime.now().isoformat(),
                'evaluation_criteria': test_case['evaluation_criteria']
            }

            self.results.append(test_result)

            # Save individual test result
            output_file = self.output_dir / f"{test_case['id']}_{self.model.replace(':', '_')}.json"
            with open(output_file, 'w') as f:
                json.dump(test_result, f, indent=2)

            return test_result

        except subprocess.TimeoutExpired:
            print("ERROR: Test timed out after 120 seconds")
            return None
        except Exception as e:
            print(f"ERROR: {e}")
            return None

    def run_all_tests(self):
        """Run all test cases"""
        print(f"\n{'='*70}")
        print(f"QWEN-CODE TEST SUITE")
        print(f"Model: {self.model}")
        print(f"Total Tests: {len(TEST_CASES)}")
        print(f"{'='*70}\n")

        for test_case in TEST_CASES:
            self.run_test(test_case)
            time.sleep(2)  # Brief pause between tests

        # Save summary
        self.save_summary()

    def save_summary(self):
        """Save test summary"""
        summary = {
            'model': self.model,
            'timestamp': datetime.now().isoformat(),
            'total_tests': len(self.results),
            'tests': self.results,
            'average_response_time': sum(r['response_time'] for r in self.results) / len(self.results) if self.results else 0
        }

        summary_file = self.output_dir / f"summary_{self.model.replace(':', '_')}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(summary_file, 'w') as f:
            json.dump(summary, f, indent=2)

        print(f"\n{'='*70}")
        print(f"TEST SUMMARY")
        print(f"{'='*70}")
        print(f"Total Tests: {summary['total_tests']}")
        print(f"Average Response Time: {summary['average_response_time']:.2f}s")
        print(f"Results saved to: {summary_file}")

class ComparisonFramework:
    """Compare Qwen responses with Claude Code responses"""

    @staticmethod
    def load_results(model_name):
        """Load test results for a model"""
        results_dir = Path("qwen-test-results")
        results = []

        for file in results_dir.glob(f"*{model_name.replace(':', '_')}.json"):
            with open(file) as f:
                results.append(json.load(f))

        return results

    @staticmethod
    def compare_models(model1_results, model2_results):
        """Compare results from two models"""
        print(f"\n{'='*70}")
        print("MODEL COMPARISON")
        print(f"{'='*70}\n")

        comparison = {
            'model1': {
                'avg_response_time': sum(r['response_time'] for r in model1_results) / len(model1_results),
                'total_tests': len(model1_results)
            },
            'model2': {
                'avg_response_time': sum(r['response_time'] for r in model2_results) / len(model2_results),
                'total_tests': len(model2_results)
            }
        }

        print(f"Model 1 (avg response): {comparison['model1']['avg_response_time']:.2f}s")
        print(f"Model 2 (avg response): {comparison['model2']['avg_response_time']:.2f}s")

        return comparison

    @staticmethod
    def generate_comparison_report(qwen_results, claude_results_file=None):
        """Generate a detailed comparison report"""
        report = []
        report.append("# Qwen2.5-Coder vs Claude Code Comparison\n")
        report.append(f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")

        report.append("## Performance Metrics\n\n")
        report.append("| Metric | Qwen2.5-Coder | Claude Code |\n")
        report.append("|--------|---------------|-------------|\n")

        avg_time = sum(r['response_time'] for r in qwen_results) / len(qwen_results)
        report.append(f"| Avg Response Time | {avg_time:.2f}s | [Manual Entry] |\n")
        report.append(f"| Total Tests | {len(qwen_results)} | [Manual Entry] |\n\n")

        report.append("## Test Results by Category\n\n")

        # Group by category
        categories = {}
        for result in qwen_results:
            cat = result['category']
            if cat not in categories:
                categories[cat] = []
            categories[cat].append(result)

        for category, tests in categories.items():
            report.append(f"### {category}\n\n")
            for test in tests:
                report.append(f"**{test['test_id']}** ({test['difficulty']})\n")
                report.append(f"- Response Time: {test['response_time']:.2f}s\n")
                report.append(f"- Criteria: {', '.join(test['evaluation_criteria'])}\n\n")

        report_file = Path("qwen-test-results") / f"comparison_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.md"
        with open(report_file, 'w') as f:
            f.write(''.join(report))

        print(f"Comparison report saved to: {report_file}")
        return report_file

def main():
    import argparse

    parser = argparse.ArgumentParser(description="Qwen-Code Test Suite")
    parser.add_argument('--model', '-m', default='qwen2.5-coder:7b', help='Model to test')
    parser.add_argument('--test', '-t', help='Run specific test ID')
    parser.add_argument('--compare', action='store_true', help='Generate comparison report')

    args = parser.parse_args()

    if args.compare:
        # Generate comparison report
        comp = ComparisonFramework()
        results = comp.load_results(args.model)
        if results:
            comp.generate_comparison_report(results)
        else:
            print("No results found. Run tests first.")
        return

    # Run tests
    runner = TestRunner(model=args.model)

    if args.test:
        # Run specific test
        test_case = next((t for t in TEST_CASES if t['id'] == args.test), None)
        if test_case:
            runner.run_test(test_case)
        else:
            print(f"Test {args.test} not found")
    else:
        # Run all tests
        runner.run_all_tests()

if __name__ == '__main__':
    main()
