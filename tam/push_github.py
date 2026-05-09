"""
Tu dong commit va push code len GitHub
Chay: python push_github.py
"""
import subprocess
import os
import sys

def run(cmd, cwd=None):
    result = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"❌ Loi: {cmd}")
        print(result.stderr)
        return False
    print(f"✅ {cmd}")
    return True

def main():
    repo_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Kiem tra co thay doi khong
    result = subprocess.run("git status --porcelain", shell=True, cwd=repo_dir, capture_output=True, text=True)
    if not result.stdout.strip():
        print("Khong co thay doi nao de commit.")
        return
    
    print(f"📁 Repo: {repo_dir}")
    print(f"📋 Co {len(result.stdout.strip().split(chr(10)))} file thay doi")
    
    # Add
    if not run("git add .", cwd=repo_dir):
        return
    
    # Commit
    msg = input("Nhap commit message [cap nhat hanja content]: ").strip()
    if not msg:
        msg = "cap nhat hanja content"
    
    if not run(f'git commit -m "{msg}"', cwd=repo_dir):
        return
    
    # Push
    if not run("git push origin main", cwd=repo_dir):
        return
    
    print("\n🎉 Da push len GitHub thanh cong!")
    print("🔗 https://github.com/xagiavanjsc-alt/hadimvn")

if __name__ == "__main__":
    main()
